use app::protobufs;
use log::{debug, error, trace};
use tauri::async_runtime;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use tokio_util::sync::CancellationToken;

use crate::device::connections::helpers::format_data_packet;
use crate::device::connections::stream_buffer::StreamBuffer;

pub fn spawn_read_handler<R>(
    cancellation_token: CancellationToken,
    read_stream: R,
    read_output_tx: UnboundedSender<Vec<u8>>,
) -> tauri::async_runtime::JoinHandle<()>
where
    R: AsyncReadExt + Send + Unpin + 'static,
{
    let handle = start_read_handler(read_stream, read_output_tx.clone());

    async_runtime::spawn(async move {
        // Check for cancellation signal or handle termination
        tokio::select! {
            _ = cancellation_token.cancelled() => {
                debug!("Read handler cancelled");
            }
            _ = handle => {
                error!("Read handler unexpectedly terminated");
            }
        }
    })
}

async fn start_read_handler<R>(read_stream: R, read_output_tx: UnboundedSender<Vec<u8>>)
where
    R: AsyncReadExt + Send + Unpin + 'static,
{
    debug!("Started read handler");

    let mut read_stream = read_stream;

    loop {
        let mut buffer = [0u8; 1024];
        match read_stream.read(&mut buffer).await {
            Ok(0) => continue,
            Ok(n) => {
                trace!("Read {} bytes from stream", n);
                let data = buffer[..n].to_vec();
                trace!("Read data: {:?}", data);
                if read_output_tx.send(data).is_err() {
                    eprintln!("Failed to send data through channel");
                    break;
                }
            }
            // TODO check if port has fatally errored, and if so, tell UI
            Err(e) => {
                eprintln!("Error reading from stream: {:?}", e);
                break;
            }
        }
    }

    debug!("Read handler finished");
}

pub fn spawn_write_handler<W>(
    cancellation_token: CancellationToken,
    write_stream: W,
    write_input_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
) -> async_runtime::JoinHandle<()>
where
    W: AsyncWriteExt + Send + Unpin + 'static,
{
    let handle = start_write_handler(cancellation_token.clone(), write_stream, write_input_rx);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("Write handler cancelled");
            }
            _ = handle => {
                error!("Write handler unexpectedly terminated");
            }
        }
    })
}

async fn start_write_handler<W>(
    cancellation_token: CancellationToken,
    mut write_stream: W,
    mut write_input_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
) where
    W: AsyncWriteExt + Send + Unpin + 'static,
{
    debug!("Started write handler");

    while let Some(message) = write_input_rx.recv().await {
        let packet_data = format_data_packet(message);
        trace!("Writing packet data: {:?}", packet_data);

        // This might not be necessary
        if cancellation_token.is_cancelled() {
            debug!("Write handler cancelled");
            break;
        }

        if let Err(e) = write_stream.write(&packet_data).await {
            error!("Error writing to stream: {:?}", e);
            break;
        }

        // if let Err(e) = write_stream.flush().await {
        //     error!("Error flushing stream: {:?}", e);
        //     break;
        // }
    }

    debug!("Write handler finished");
}

pub fn spawn_processing_handler(
    cancellation_token: CancellationToken,
    read_output_rx: UnboundedReceiver<Vec<u8>>,
    decoded_packet_tx: UnboundedSender<protobufs::FromRadio>,
) -> async_runtime::JoinHandle<()> {
    let handle = start_processing_handler(read_output_rx, decoded_packet_tx);

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

async fn start_processing_handler(
    mut read_output_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
    decoded_packet_tx: UnboundedSender<protobufs::FromRadio>,
) {
    trace!("Started message processing handler");

    let mut buffer = StreamBuffer::new(decoded_packet_tx);

    while let Some(message) = read_output_rx.recv().await {
        trace!("Processing {} bytes from radio", message.len());
        buffer.process_incoming_bytes(message);
    }

    trace!("Processing read_output_rx channel closed");
}
