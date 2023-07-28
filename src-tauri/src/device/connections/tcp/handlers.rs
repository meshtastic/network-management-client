use app::protobufs;
use log::{debug, error, trace, warn};
use tauri::async_runtime;
use tokio::{io::AsyncReadExt, sync::broadcast};
use tokio_util::sync::CancellationToken;

use crate::device::connections::{stream_buffer::StreamBuffer, tcp::TcpConnection};

// Handlers

pub fn spawn_tcp_read_handler(
    read_stream: tokio::net::tcp::OwnedReadHalf,
    cancellation_token: CancellationToken,
    read_output_tx: tokio::sync::mpsc::UnboundedSender<Vec<u8>>,
) -> async_runtime::JoinHandle<()> {
    let handle = start_tcp_read_worker(read_stream, read_output_tx);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("TCP read handler cancelled");
            }
            _ = handle => {
                error!("TCP read handler unexpectedly terminated");
            }
        }
    })
}

pub fn spawn_tcp_write_handler(
    write_stream: tokio::net::tcp::OwnedWriteHalf,
    cancellation_token: CancellationToken,
    write_input_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
) -> async_runtime::JoinHandle<()> {
    let handle = start_tcp_write_worker(write_stream, write_input_rx);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("TCP write handler cancelled");
            }
            _ = handle => {
                error!("TCP write handler unexpectedly terminated");
            }
        }
    })
}

pub fn spawn_tcp_message_processing_handler(
    cancellation_token: CancellationToken,
    read_output_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
    decoded_packet_tx: broadcast::Sender<protobufs::FromRadio>,
) -> async_runtime::JoinHandle<()> {
    let handle = start_tcp_message_processing_worker(read_output_rx, decoded_packet_tx);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("Message processing handler cancelled");
            }
            _ = handle => {
              error!("Message processing handler unexpectedly terminated");
            }
        }
    })
}

// Workers

async fn start_tcp_read_worker(
    read_stream: tokio::net::tcp::OwnedReadHalf,
    read_output_tx: tokio::sync::mpsc::UnboundedSender<Vec<u8>>,
) -> Result<(), String> {
    trace!("Started TCP read worker");

    let mut read_stream = read_stream; // Move read stream into worker context

    loop {
        let mut incoming_tcp_buf: Vec<u8> = vec![0; 1024];
        let read_bytes = match read_stream.read(&mut incoming_tcp_buf).await {
            Ok(bytes) => bytes,
            Err(e) => match e.kind() {
                tokio::io::ErrorKind::WouldBlock => {
                    continue;
                }
                tokio::io::ErrorKind::ConnectionReset => {
                    error!("TCP connection reset");
                    break;
                }
                tokio::io::ErrorKind::ConnectionAborted => {
                    error!("TCP connection aborted");
                    break;
                }
                _ => {
                    error!("Error reading from TCP port: {}", e.to_string());
                    continue;
                }
            },
        };

        if !incoming_tcp_buf.is_empty() && read_bytes > 0 {
            trace!(
                "Received info from radio: {:?}",
                incoming_tcp_buf[..read_bytes].to_vec()
            );

            match read_output_tx.send(incoming_tcp_buf[..read_bytes].to_vec()) {
                Ok(_) => (),
                Err(err) => {
                    warn!("Binary read packet transmission failed: {}", err);
                    break;
                }
            };
        }

        incoming_tcp_buf.clear();
    }

    Ok(())
}

async fn start_tcp_write_worker(
    write_stream: tokio::net::tcp::OwnedWriteHalf,
    mut write_input_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
) {
    trace!("Started TCP write worker");

    let mut write_stream = write_stream; // Move write stream into worker context

    while let Some(data) = write_input_rx.recv().await {
        match TcpConnection::write_to_radio(&mut write_stream, data).await {
            Ok(()) => (),
            Err(e) => error!("Error writing to radio: {:?}", e.to_string()),
        };
    }

    debug!("TCP write write_input_rx channel closed");
}

async fn start_tcp_message_processing_worker(
    mut read_output_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
    decoded_packet_tx: broadcast::Sender<protobufs::FromRadio>,
) {
    trace!("Started message processing worker");

    let mut buffer = StreamBuffer::new(decoded_packet_tx);

    while let Some(message) = read_output_rx.recv().await {
        buffer.process_incoming_bytes(message);
    }

    debug!("TCP processing read_output_rx channel closed");
}
