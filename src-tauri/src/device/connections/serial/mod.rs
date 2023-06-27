#![allow(dead_code)]

mod handlers;

use app::protobufs;
use async_trait::async_trait;
use log::trace;
use serial2::{FlowControl, SerialPort};
use std::{sync::Arc, time::Duration};
use tauri::async_runtime;
use tokio::sync::broadcast;
use tokio_util::sync::CancellationToken;

use super::{helpers::format_data_packet, MeshConnection};

#[derive(Debug, Default)]
pub struct SerialConnection {
    pub on_decoded_packet: Option<broadcast::Receiver<protobufs::FromRadio>>,
    write_input_tx: Option<tokio::sync::mpsc::UnboundedSender<Vec<u8>>>,

    serial_read_handle: Option<async_runtime::JoinHandle<()>>,
    serial_write_handle: Option<async_runtime::JoinHandle<()>>,
    message_processing_handle: Option<async_runtime::JoinHandle<()>>,

    cancellation_token: Option<CancellationToken>,
}

// Not a complete implementation, this is only used
// to transmit the `MeshDevice` struct to the UI, where
// the `connection` field is skipped be serde
impl Clone for SerialConnection {
    fn clone(&self) -> Self {
        Self::new()
    }
}

#[async_trait]
impl MeshConnection for SerialConnection {
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

        trace!("Serial handlers fully disconnected");

        Ok(())
    }

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

pub enum SerialConnectionError {
    PortOpenError,
    ConfigurationError,
}

impl SerialConnection {
    pub fn new() -> Self {
        SerialConnection::default()
    }

    fn write_to_radio(port: Arc<SerialPort>, data: Vec<u8>) -> Result<(), String> {
        let data_with_header = format_data_packet(data);
        let message_buffer: &[u8] = data_with_header.as_slice();
        port.write(message_buffer).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_available_ports() -> Result<Vec<String>, String> {
        let available_ports = SerialPort::available_ports().map_err(|e| e.to_string())?;

        let ports: Vec<String> = available_ports
            .iter()
            .map(|p| p.display().to_string())
            .collect();

        Ok(ports)
    }

    pub async fn connect(
        &mut self,
        app_handle: tauri::AppHandle,
        port_name: String,
        baud_rate: u32,
        dtr: bool,
        rts: bool,
    ) -> Result<(), SerialConnectionError> {
        // Create serial port connection

        let mut port = SerialPort::open(port_name.clone(), baud_rate)
            .map_err(|_e| SerialConnectionError::PortOpenError)?;

        let mut config = port
            .get_configuration()
            .map_err(|_e| SerialConnectionError::ConfigurationError)?;

        config.set_flow_control(FlowControl::XonXoff);

        port.set_configuration(&config)
            .map_err(|_e| SerialConnectionError::ConfigurationError)?;

        port.set_dtr(dtr)
            .map_err(|_e| SerialConnectionError::ConfigurationError)?;

        port.set_rts(rts)
            .map_err(|_e| SerialConnectionError::ConfigurationError)?;

        port.set_read_timeout(Duration::from_millis(10))
            .map_err(|_e| SerialConnectionError::ConfigurationError)?;

        let port = Arc::new(port);

        // Create message channels

        let (write_input_tx, write_input_rx) = tokio::sync::mpsc::unbounded_channel::<Vec<u8>>();
        let (read_output_tx, read_output_rx) = tokio::sync::mpsc::unbounded_channel::<Vec<u8>>();
        let (decoded_packet_tx, decoded_packet_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        self.write_input_tx = Some(write_input_tx);
        self.on_decoded_packet = Some(decoded_packet_rx);

        let read_port = port.clone();
        let write_port = port;

        // Spawn worker threads with kill switch

        let cancellation_token = CancellationToken::new();

        self.serial_read_handle = Some(handlers::spawn_serial_read_handler(
            app_handle,
            cancellation_token.clone(),
            read_port,
            read_output_tx,
            port_name.clone(),
        ));

        self.serial_write_handle = Some(handlers::spawn_serial_write_handler(
            cancellation_token.clone(),
            write_port,
            write_input_rx,
        ));

        self.message_processing_handle = Some(handlers::spawn_serial_message_processing_handler(
            cancellation_token.clone(),
            read_output_rx,
            decoded_packet_tx,
        ));

        self.cancellation_token = Some(cancellation_token);

        // Sleep for device stability (from web client, not positive we need this)
        tokio::time::sleep(Duration::from_millis(200)).await;

        Ok(())
    }
}
