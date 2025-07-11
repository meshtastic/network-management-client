![GitHub Header (V2)](https://github.com/ajmcquilkin/meshtastic-network-management-client/assets/46639306/d1d66bc5-a0ea-4945-98fe-aaa2d552b2de)

<div align="center">
  <h1 align="center">Meshtastic Network Management Client</h1>
  <p align="center">A desktop client for analyzing and managing large-scale, low-bandwidth mesh networks</p>
</div>

<p align="center">
  <a href="https://github.com/meshtastic/network-management-client/actions/workflows/testing.yml">
    <img alt="Application testing action status" src="https://github.com/meshtastic/network-management-client/actions/workflows/testing.yml/badge.svg">
  </a>
  
  <a href="https://github.com/meshtastic/network-management-client/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/meshtastic/network-management-client">
  </a>
  
  <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/meshtastic/network-management-client/total">
  
  <a href="https://opencollective.com/meshtastic">
    <img alt="Open Collective backers" src="https://img.shields.io/opencollective/backers/meshtastic?label=support%20meshtastic">
  </a>
  
  <a href="https://u24.gov.ua/">
    <img alt="Stand with Ukraine" src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg">
  </a>
</p>

## :wave: Introduction

This application is a desktop client for the [Meshtastic Project](https://meshtastic.org/), designed to allow users to reliably manage large, decentralized mesh networks. Currently the Meshtastic client ecosystem has strong support for managing single nodes, but minimal support for network-level management and analysis. The goal of this project is to give users confidence in their Meshtastic networks as a reliable communications infrastructure through novel algorithmic analysis and connection-level insights.

![image](https://user-images.githubusercontent.com/46639306/230783389-330754f9-a1c3-4b8b-8db9-a226c612f011.png)

## :pray: Call for Contributions

We're looking for developers willing to contribute towards or take lead on the following major initiatives:

-   Bluetooth device connection
-   Full offline map support, including region-based downloading and loading of custom maps (will require Meshtastic mirror of the [OSM tile DB](https://tile.openstreetmap.org/))
-   Offline firmware flashing
-   Rust backend testing (unit, integration, e2e, smoke)
-   TS frontend testing (unit, integration, e2e, smoke)
-   Adding support for remote node configuration
-   Integrating UI components into the [Storybook](https://storybook.js.org/) framework

## :rocket: Functionality

This project is still in early stages of development, but here's a rough roadmap of functionality we're working on. We're placing a high priority on getting our core infrastructure right, since this is the core of any robust and effective UI layer.

-   [x] :link: Core dataflow infrastructure
    -   [x] Serial data send/receive
    -   [x] Rust protobuf integration (.proto -> .rs)
    -   [x] Packet encode/decode
    -   [x] Device state management
-   [x] :art: Core UI infrastructure
    -   [x] Tauri command management
    -   [x] Tauri event management
    -   [x] Redux saga dataflow
-   [x] :artificial_satellite: Network topology collection
    -   [x] RFC for novel packet ([completed](https://www.adammcquilkin.com/Adam_McQuilkin_-_Meshtastic_Network_Centralization_Proposal.pdf))
    -   [x] MVP protobuf changes ([completed](https://github.com/uhuruhashimoto/protobufs))
    -   [x] MVP firmware changes ([completed](https://github.com/uhuruhashimoto/firmware))
    -   [x] Community protobuf review ([completed](https://github.com/meshtastic/protobufs/pull/341))
    -   [x] Community firmware review ([completed](https://github.com/meshtastic/firmware/pull/2535))
-   [ ] :nerd_face: Algorithmic analysis
    -   [x] Infrastructure
        -   [x] Network packet collation
        -   [x] Network graph construction
        -   [x] Algorithm runners
    -   [ ] UI
        -   [x] MVP algorithm runner pane
        -   [ ] On-map algorithm UI
        -   [ ] Automatic algorithm rerunning
-   [ ] :radio: Node management
    -   [x] Node peer table
    -   [ ] Network configuration (multi-device)
    -   [ ] Remote node configuration
-   [x] :pushpin: Waypoint management
    -   [x] Managed waypoint table
    -   [x] In-channel waypoint sending
    -   [x] On-map waypoint tooltip
-   [ ] :globe_with_meridians: Web client parity (UI)
    -   [x] Map node view
    -   [ ] Messaging
        -   [x] Channel messaging
        -   [ ] Direct messaging
    -   [ ] Channel import/export via QR code
    -   [x] Configuration
        -   [x] Device configuration
        -   [x] Module configuration
        -   [x] Channel configuration
-   [ ] :mount_fuji: Offline map view
    -   [ ] Offline map storage
    -   [ ] Region-based downloading
-   [ ] :page_facing_up: Network data export

## 📻 Hardware Requirements

This project is built on the Meshtastic hardware ecosystem, and as such this client requires that you have access to a Meshtastic radio.
See the [Meshtastic docs for hardware recommendations](https://meshtastic.org/docs/hardware/devices/).

## :computer: Development

### Prerequisites

This project is built in Rust and React TypeScript, and managed using the PNPM package manager. As such, this project requires the following programs to be installed on your development machine:

-   [Rust Language](https://www.rust-lang.org/)
-   [Node.js](https://nodejs.org/en/)
-   [PNPM Package Manager](https://pnpm.io/installation)

### Installation

To run this project locally, follow the steps below:

1. Ensure you have Rust, Node.js, and PNPM installed (see [Prerequisites](#prerequisites))
2. Ensure that you have all [Tauri dependencies installed](https://tauri.app/v1/guides/getting-started/prerequisites/) (depends on your OS)
3. Clone this repositiory to a local directory. This can be done by running `git clone https://github.com/meshtastic/network-management-client.git`
4. Recursively clone our Git submodules by running `git submodule update --init`
5. Install all required NPM packages with `pnpm i`
6. Once you have completed these steps, verify your installation with the `pnpm run rust:dev` command. The application should compile successfully, and you should see the application open successfully. If this process fails for you, please [let us know](https://github.com/meshtastic/network-management-client/issues)!

### Recommended IDE Setup

While this project can be developed within any text editor, we recommend the [Visual Studio Code](https://code.visualstudio.com/) editor. If using VSCode, we strongly recommend that you install the following Visual Studio Code extensions. These extensions both enforce code style and enable language and framework support for our tech stack.

-   [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) - JavaScript LSP with formatting and linting
-   [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) - Rust LSP with code linting, formatting, and quality suggestions

### Development Commands

To standardize our development flow, we utilize PNPM commands, defined in `package.json`. These commands can be run with the `pnpm run NAME ...ARGS` syntax. Our commands are broken out into two primary categories, `rust:*` commands and `ui:*` commands. The `rust:*` commands run the entire desktop application, where the `ui:*` commands only run the UI layer.

> **Note:** We strongly recommend against using the `ui:dev` and `ui:build` commands manually. These commands are invoked internally by the `rust:dev` and `rust:build` commands, respectively. You will **not** be able to connect to a serial devce when running the `ui:dev` command, as this logic is not handled in the UI layer.

-   `pnpm run rust:dev` - Starts the desktop application in development mode, allowing for hot reloading of UI and Rust code
-   `pnpm run rust:build` - Builds the desktop application in production mode for your system architecture. Currently we only use this command for testing our application's CLI argument parser.
-   `pnpm run rust:test` - Runs backend tests on the Rust codebase directory (`/src-tauri`). This command also generates TypeScript client bindings in the `/src-tauri/bindings` directory. Add `-- --show-output` to show Rust `println!` macro calls within test suites.

-   `pnpm run ui:dev` - Starts the UI development server, allowing for UI development in a browser environment. Note that any code that interfaces with the Rust backend **will not function** within this browser environment, meaning you will be unable to connect to serial devices in this context
-   `pnpm run ui:build`: - Runs a production build on the UI code into the `dist` directory
-   `pnpm run ui:lint` - Uses ESLint to check for code style errors. Note that our CI pipeline requires that this command succeeds before any changes can be merged
-   `pnpm run ui:format` - Formats the UI codebase using [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/). We strongly recommend you run this before creating a PR!
-   `pnpm run ui:test` - Runs UI test suite using [Jest](https://jestjs.io/). Currently the project does not have a UI testing suite, but we're very open to contributions!

> **Note:** On Linux, your user may not have permission to access a given serial port. If this happens, you will likely need to add your user to the group that controls the serial port you want to access. You can find the group that controls a serial port via the `ls -ld PATH_TO_PORT_HERE` command. You can add your user to this group via the `usermod -a -G GROUP_NAME_HERE $USER` command.

## :heart: Contributing

As we are still very early in development, we don't yet have a standardized framework for accepting contributions. This being said, we are very open to suggestions and/or code changes! If you're interested in contributing to this repository, we would ask that you first check our issue board to ensure your work isn't duplicating the work of others. Then, please make an issue on our board so we know what you're interested in working on. If you have any questions about the project, we would love to hear from you!
