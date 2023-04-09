#![allow(dead_code)]

mod handlers;
pub mod helpers;

use app::protobufs;
use async_trait::async_trait;
use prost::Message;
use serialport::SerialPort;
use std::{
    sync::{self, Arc, Mutex},
    thread::{self, JoinHandle},
    time::Duration,
};
use tokio::sync::broadcast;

#[derive(Clone, Copy, Debug, Default)]
pub enum PacketDestination {
    Local,
    #[default]
    Broadcast,
    Node(u32),
}

#[derive(Debug, Default)]
pub struct SerialConnection {
    pub on_decoded_packet: Option<broadcast::Receiver<protobufs::FromRadio>>,
    write_input_tx: Option<sync::mpsc::Sender<Vec<u8>>>,
    is_connection_active: Arc<Mutex<bool>>,

    serial_read_handle: Option<JoinHandle<()>>,
    serial_write_handle: Option<JoinHandle<()>>,
    message_processing_handle: Option<JoinHandle<()>>,
}

#[async_trait]
pub trait MeshConnection {
    fn new() -> Self;
    fn configure(&mut self, config_id: u32) -> Result<(), String>;
    fn send_raw(&mut self, data: Vec<u8>) -> Result<(), String>;
    fn write_to_radio(port: &mut Box<dyn SerialPort>, data: Vec<u8>) -> Result<(), String>;
}

#[async_trait]
impl MeshConnection for SerialConnection {
    fn new() -> Self {
        SerialConnection {
            write_input_tx: None,
            on_decoded_packet: None,
            is_connection_active: Arc::new(Mutex::new(false)),

            serial_read_handle: None,
            serial_write_handle: None,
            message_processing_handle: None,
        }
    }

    fn configure(&mut self, config_id: u32) -> Result<(), String> {
        let to_radio = protobufs::ToRadio {
            payload_variant: Some(protobufs::to_radio::PayloadVariant::WantConfigId(config_id)),
        };

        let mut packet_buf: Vec<u8> = vec![];
        to_radio
            .encode::<Vec<u8>>(&mut packet_buf)
            .map_err(|e| e.to_string())?;

        self.send_raw(packet_buf)?;

        Ok(())
    }

    fn send_raw(&mut self, data: Vec<u8>) -> Result<(), String> {
        let channel = self
            .write_input_tx
            .as_ref()
            .ok_or("Could not send message to write channel")
            .map_err(|e| e.to_string())?;

        channel.send(data).map_err(|e| e.to_string())?;
        Ok(())
    }

    fn write_to_radio(port: &mut Box<dyn SerialPort>, data: Vec<u8>) -> Result<(), String> {
        let binding = helpers::format_serial_packet(data);
        let message_buffer: &[u8] = binding.as_slice();
        port.write(message_buffer).map_err(|e| e.to_string())?;

        Ok(())
    }
}

impl SerialConnection {
    pub fn get_available_ports() -> Result<Vec<String>, String> {
        let available_ports = serialport::available_ports().map_err(|e| e.to_string())?;

        let ports: Vec<String> = available_ports
            .iter()
            .map(|p| p.port_name.clone())
            .collect();

        Ok(ports)
    }

    pub fn connect(
        &mut self,
        app_handle: tauri::AppHandle,
        port_name: String,
        baud_rate: u32,
    ) -> Result<(), String> {
        let port = serialport::new(port_name.clone(), baud_rate)
            .timeout(Duration::from_millis(10))
            .open()
            .map_err(|e| {
                format!(
                    "Could not open serial port \"{}\": {}",
                    port_name.clone(),
                    e
                )
            })?;

        // Enable serial connection flag
        // Don't hold the lock for longer than it takes to set the flag
        {
            let mut guard = self
                .is_connection_active
                .lock()
                .map_err(|e| e.to_string())
                .expect("Could not lock writer active mutex");

            *guard = true;
        }

        let (write_input_tx, write_input_rx) = sync::mpsc::channel::<Vec<u8>>();
        let (read_output_tx, read_output_rx) = sync::mpsc::channel::<Vec<u8>>();
        let (decoded_packet_tx, decoded_packet_rx) = broadcast::channel::<protobufs::FromRadio>(32);

        self.write_input_tx = Some(write_input_tx);
        self.on_decoded_packet = Some(decoded_packet_rx);

        let read_port = port.try_clone().map_err(|e| {
            format!(
                "Could not clone serial port \"{}\": {}",
                port_name.clone(),
                e
            )
        })?;

        self.serial_read_handle = Some(handlers::spawn_serial_read_handler(
            app_handle,
            self.is_connection_active.clone(),
            read_port,
            read_output_tx,
        ));

        self.serial_write_handle = Some(handlers::spawn_serial_write_handler(
            self.is_connection_active.clone(),
            port,
            write_input_rx,
        ));

        self.message_processing_handle = Some(handlers::spawn_message_processing_handle(
            self.is_connection_active.clone(),
            read_output_rx,
            decoded_packet_tx,
        ));

        thread::sleep(Duration::from_millis(200)); // Device stability

        Ok(())
    }

    pub fn disconnect(&mut self) -> Result<(), String> {
        // Close channels, which will kill held threads

        self.on_decoded_packet = None;
        self.write_input_tx = None;

        // Tell worker threads to shut down
        // We only need to set this flag, this will cause deadlock if the flag is not released
        // This thread is dependent on the other threads joining, which can only happen if this lock is released
        {
            let mut guard = self
                .is_connection_active
                .lock()
                .map_err(|e| e.to_string())?;

            *guard = false;
        }

        // Wait for threads to close

        if let Some(serial_read_handle) = self.serial_read_handle.take() {
            serial_read_handle
                .join()
                .map_err(|_e| "Error joining serial_read_handle".to_string())?;
        }

        if let Some(serial_write_handle) = self.serial_write_handle.take() {
            serial_write_handle
                .join()
                .map_err(|_e| "Error joining serial_write_handle".to_string())?;
        }

        if let Some(message_processing_handle) = self.message_processing_handle.take() {
            message_processing_handle
                .join()
                .map_err(|_e| "Error joining message_processing_handle".to_string())?;
        }

        Ok(())
    }
}
