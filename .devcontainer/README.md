## :whale: Using the Devcontainer

This project includes a [devcontainer](https://code.visualstudio.com/docs/devcontainers/containers) configuration for Visual Studio Code, which allows you to develop inside a containerized environment. This ensures that all developers have a consistent development environment, regardless of their local machine setup.

> **Note:** The devcontainer is tested on:\
Windows 11 with Docker Desktop and WSL2 Ubuntu.

### Prerequisites

To use the devcontainer, you need to have the following installed:

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/get-started)
- [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for Visual Studio Code.

### Setup

1. Open up a new blank workspace in Visual Studio Code.
2. Navigate to the Remote Explorer extension.
3. Clone this repository in container volume. (Dev Volumes)
4. Launch the Dev Container.

## Application

Once the devcontainer is set up, you can use the same development commands as described in the [Development Commands](/README.md#development-commands) section. The devcontainer includes all necessary dependencies and tools for developing and testing the project.

> **Note:** If you encounter any issues you can always refresh the devcontainer by rebuilding it. `F1` > `Dev Containers: Rebuild Container`

By using the devcontainer, you ensure that your development environment is consistent with the rest of the team, reducing the likelihood of environment-specific issues.

## Meshtasticd and CLI

The container has [meshtasticd](https://meshtastic.org/docs/hardware/devices/linux-native-hardware/) installed and can be started by running `meshtasticd -c .devcontainer/config.yaml` in the terminal. \
This allows connecting to a meshtastic device on `localhost:4403`.

The container also has [meshtastic CLI](https://meshtastic.org/docs/software/python/cli/) installed, once `meshtasticd` is running you can configure it using `meshtastic --host localhost COMMANDS`.

```
meshtastic --host localhost --set-owner Devcontainer --set-owner-short VSCD
meshtastic --host localhost --setlat 51.5007324 --setlon -0.1294963
```

> **Note:** If you encounter any issues connection to `localhost:4403` you might need to run the `meshtasticd -c .devcontainer/config.yaml` command again.
