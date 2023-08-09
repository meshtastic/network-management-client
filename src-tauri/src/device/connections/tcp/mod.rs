mod handlers;

use std::time::Duration;

use app::protobufs;
use async_trait::async_trait;
use log::{error, trace};
use tauri::async_runtime;
use tokio::{io::AsyncWriteExt, sync::broadcast};
use tokio_util::sync::CancellationToken;

use crate::device::connections::helpers::format_data_packet;

use super::MeshConnection;

#[derive(Debug, Default)]
pub struct TcpConnection {
    pub on_decoded_packet: Option<broadcast::Receiver<protobufs::FromRadio>>,
    write_input_tx: Option<tokio::sync::mpsc::UnboundedSender<Vec<u8>>>,

    serial_read_handle: Option<async_runtime::JoinHandle<()>>,
    serial_write_handle: Option<async_runtime::JoinHandle<()>>,
    message_processing_handle: Option<async_runtime::JoinHandle<()>>,

    cancellation_token: Option<CancellationToken>,
}

#[async_trait]
impl MeshConnection for TcpConnection {
    async fn ping_radio(&mut self) -> Result<(), String> {
        Ok(())
    }

    async fn disconnect(&mut self) -> Result<(), String> {
        // Tell worker threads to shut down
        if let Some(token) = self.cancellation_token.take() {
            token.cancel();
        }

        // Close channels, which will kill held threads

        self.on_decoded_packet = None;
        self.write_input_tx = None;

        // Wait for threads to close

        if let Some(serial_read_handle) = self.serial_read_handle.take() {
            serial_read_handle
                .await
                .map_err(|_e| "Error joining serial_read_handle".to_string())?;
        }

        if let Some(serial_write_handle) = self.serial_write_handle.take() {
            serial_write_handle
                .await
                .map_err(|_e| "Error joining serial_write_handle".to_string())?;
        }

        if let Some(message_processing_handle) = self.message_processing_handle.take() {
            message_processing_handle
                .await
                .map_err(|_e| "Error joining message_processing_handle".to_string())?;
        }

        trace!("TCP handlers fully disconnected");

        Ok(())
    }

    // TODO it would be great to standardize the threading helpers and this function
    async fn send_raw(&mut self, data: Vec<u8>) -> Result<(), String> {
        let channel = self
            .write_input_tx
            .as_ref()
            .ok_or("Could not send message to write channel")
            .map_err(|e| e.to_string())?;

        channel.send(data).map_err(|e| e.to_string())?;
        Ok(())
    }
}

impl TcpConnection {
    pub fn new() -> Self {
        TcpConnection::default()
    }

    pub fn get_cancellation_token(&self) -> Option<CancellationToken> {
        self.cancellation_token.clone()
    }

    pub async fn write_to_radio(
        write_stream: &mut tokio::net::tcp::OwnedWriteHalf,
        data: Vec<u8>,
    ) -> Result<(), String> {
        let data_with_header = format_data_packet(data);
        let message_buffer: &[u8] = data_with_header.as_slice();

        write_stream.write(&message_buffer).await.map_err(|e| {
            error!("Error writing to radio: {:?}", e.to_string());
            e.to_string()
        })?;

        Ok(())
    }

    // TODO need a way to kill timed out connections
    pub async fn connect(&mut self, address: String) -> Result<(), String> {
        // Create TCP connection

        let connection_future = tokio::net::TcpStream::connect(address.clone());
        let timeout_duration = Duration::from_millis(3000);

        let stream = match tokio::time::timeout(timeout_duration, connection_future).await {
            Ok(stream) => stream.map_err(|e| e.to_string())?,
            Err(e) => {
                return Err(format!(
                    "Timed out connecting to {} with error \"{}.\" Check that the radio is on, network is enabled, and the address is correct.",
                    address,
                    e.to_string()
                ));
            }
        };

        // Create message channels

        let (write_input_tx, write_input_rx) = tokio::sync::mpsc::unbounded_channel::<Vec<u8>>();
        let (read_output_tx, read_output_rx) = tokio::sync::mpsc::unbounded_channel::<Vec<u8>>();
        let (decoded_packet_tx, decoded_packet_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        self.write_input_tx = Some(write_input_tx);
        self.on_decoded_packet = Some(decoded_packet_rx);

        // Spawn worker threads with kill switch

        let (read_stream, write_stream) = stream.into_split();
        let cancellation_token = CancellationToken::new();

        self.serial_read_handle = Some(handlers::spawn_tcp_read_handler(
            read_stream,
            cancellation_token.clone(),
            read_output_tx,
        ));

        self.serial_write_handle = Some(handlers::spawn_tcp_write_handler(
            write_stream,
            cancellation_token.clone(),
            write_input_rx,
        ));

        self.message_processing_handle = Some(handlers::spawn_tcp_message_processing_handler(
            cancellation_token.clone(),
            read_output_rx,
            decoded_packet_tx,
        ));

        self.cancellation_token = Some(cancellation_token);

        Ok(())
    }
}
