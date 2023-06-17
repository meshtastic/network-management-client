use app::protobufs;
use log::{debug, error, trace, warn};
use serial2::SerialPort;
use std::{io::ErrorKind, sync::Arc};
use tauri::{async_runtime, Manager};
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

use crate::device::connections::helpers::process_serial_bytes;

use super::SerialConnection;

// Handlers

pub fn spawn_serial_read_handler(
    app_handle: tauri::AppHandle,
    cancellation_token: CancellationToken,
    read_port: Arc<SerialPort>,
    read_output_tx: tokio::sync::mpsc::UnboundedSender<Vec<u8>>,
    port_name: String,
) -> async_runtime::JoinHandle<()> {
    let handle = start_serial_read_worker(app_handle, read_port, read_output_tx, port_name);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("Serial read handler cancelled");
            }
            _ = handle => {
                error!("Serial read handler unexpectedly terminated");
            }
        }
    })
}

pub fn spawn_serial_write_handler(
    cancellation_token: CancellationToken,
    port: Arc<SerialPort>,
    write_input_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
) -> async_runtime::JoinHandle<()> {
    let handle = start_serial_write_worker(port, write_input_rx);

    async_runtime::spawn(async move {
        tokio::select! {
            _ = cancellation_token.cancelled() => {
              debug!("Serial write handler cancelled");
            }
            _ = handle => {
                error!("Serial write handler unexpectedly terminated");
            }
        }
    })
}

pub fn spawn_serial_message_processing_handler(
    cancellation_token: CancellationToken,
    read_output_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
    decoded_packet_tx: broadcast::Sender<protobufs::FromRadio>,
) -> async_runtime::JoinHandle<()> {
    let handle = start_serial_message_processing_worker(read_output_rx, decoded_packet_tx);

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

#[derive(Clone, Debug)]
enum SerialReadResult {
    Success(Vec<u8>),
    TimedOut,
    FatalError,
    NonFatalError,
}

async fn start_serial_read_worker(
    app_handle: tauri::AppHandle,
    port: Arc<SerialPort>,
    read_output_tx: tokio::sync::mpsc::UnboundedSender<Vec<u8>>,
    port_name: String,
) {
    trace!("Started serial read worker");

    loop {
        let (send, recv) = tokio::sync::oneshot::channel::<SerialReadResult>();

        let app_handle = app_handle.clone();
        let read_port = port.clone();
        let port_name = port_name.clone();

        let handle = tokio::task::spawn_blocking(move || {
            let mut incoming_serial_buf: Vec<u8> = vec![0; 1024];
            let recv_bytes = match read_port.read(incoming_serial_buf.as_mut_slice()) {
                Ok(o) => o,
                Err(ref e) if e.kind() == ErrorKind::TimedOut =>
                {
                    send.send(SerialReadResult::TimedOut).expect("Failed to send read result");
                    return;
                },
                Err(ref e)
                    if e.kind() == ErrorKind::BrokenPipe // Linux disconnect
                        || e.kind() == ErrorKind::PermissionDenied // Windows disconnect
                        =>
                {
                    error!("Serial read failed (fatal): {:?}", e);

                    app_handle
                        .app_handle()
                        .emit_all("device_disconnect", port_name)
                        .expect("Could not dispatch disconnection event");

                    send.send(SerialReadResult::FatalError).expect("Failed to send read result");
                    return;
                },
                Err(err) => {
                    error!("Serial read failed: {:?}", err);
                    send.send(SerialReadResult::NonFatalError).expect("Failed to send read result");
                    return;
                }
            };

            send.send(SerialReadResult::Success(
                incoming_serial_buf[..recv_bytes].to_vec(),
            ))
            .expect("Failed to send read result");
        });

        match handle.await {
            Ok(_) => (),
            Err(err) => {
                error!("Error awaiting read IO handle: {}", err);
                continue;
            }
        };

        let read_result = match recv.await {
            Ok(r) => r,
            Err(err) => {
                warn!("Error receiving serial read: {}", err);
                continue;
            }
        };

        let recv_message = match read_result {
            SerialReadResult::Success(m) => m,
            SerialReadResult::TimedOut => {
                continue;
            }
            SerialReadResult::FatalError => {
                break;
            }
            SerialReadResult::NonFatalError => {
                continue;
            }
        };

        if !recv_message.is_empty() {
            trace!("Received info from radio: {:?}", recv_message);

            match read_output_tx.send(recv_message) {
                Ok(_) => (),
                Err(err) => {
                    warn!("Binary read packet transmission failed: {}", err);
                    break;
                }
            };
        }
    }
}

async fn start_serial_write_worker(
    port: Arc<SerialPort>,
    mut write_input_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
) {
    trace!("Started serial write worker");

    while let Some(data) = write_input_rx.recv().await {
        match SerialConnection::write_to_radio(port.clone(), data) {
            Ok(()) => (),
            Err(e) => error!("Error writing to radio: {:?}", e.to_string()),
        };
    }

    trace!("Serial write write_input_rx channel closed");
}

async fn start_serial_message_processing_worker(
    mut read_output_rx: tokio::sync::mpsc::UnboundedReceiver<Vec<u8>>,
    decoded_packet_tx: broadcast::Sender<protobufs::FromRadio>,
) {
    trace!("Started message processing worker");

    let mut transform_serial_buf: Vec<u8> = vec![];

    while let Some(message) = read_output_rx.recv().await {
        process_serial_bytes(&mut transform_serial_buf, &decoded_packet_tx, message);
    }

    trace!("Serial processing read_output_rx channel closed");
}
