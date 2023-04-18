# Project Testing Overview

## UI Layer

Todo

## Rust Layer

Todo

### CLI Matching

Todo

### Analytics

Todo

### Graph

Todo

### IPC

Todo

### Mesh

Todo

#### Device

- `new()` initializes `ready: false` and `region_unset: true` with a random `config_id`
- `get_node_user_name` returns valid name or `None`
- `get_channel_name` returns valid name or `None`

- Notifications TODO
- Test specific, notable combinations of results struct TODO

#### Serial Connection

- Connection fails with invalid serial port name

- Connection creates valid serial reader thread
- Connection creates valid serial writer thread
- Connection creates valid message processing thread

- Reader sends serial data onto channel
- Message processor receives valid data from reader
- Writer receives data from processing channel

- Message processor TODO
- Message processor dispatches valid packets into channel

- Writer thread terminates when connection deactivates
- Reader thread terminates when connection deactivates
- Message processing thread terminates when connection deactivates
- Disconnect function resets stored channels and join handles
