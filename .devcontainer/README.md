# Development Container

This repository includes configuration for a [development container](https://code.visualstudio.com/docs/devcontainers/containers) for working with network-management-client in a local container.

## Application

Once the container has finished processing everything the GUI interface opens up. \
If not, run: `pnpm run rust:dev`

More information [README](../README.md).

## Meshtasticd and CLI

The container has [meshtasticd](https://meshtastic.org/docs/hardware/devices/linux-native-hardware/) installed and can be started simply by running `meshtasticd` in the terminal. \
This allows connecting to `localhost:4403`.

The container also has [meshtastic CLI](https://meshtastic.org/docs/software/python/cli/) installed, once `meshtasticd` is running you can configure it using `meshtastic --host localhost COMMANDS`.

```
meshtastic --host localhost --set-owner Devcontainer --set-owner-short VSCD
meshtastic --host localhost --setlat 51.5007324 --setlon -0.1294963
```