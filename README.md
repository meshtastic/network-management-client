![image](https://user-images.githubusercontent.com/46639306/229531059-2f07b9c1-982f-4eaa-aae7-b8663e1e94a5.png)

<div align="center">
  <h1 align="center">Meshtastic Network Management Client</h1>
  <p align="center">An unofficial Meshtastic desktop client for analyzing and managing large-scale, low-bandwidth mesh networks</p>
</div>

<p align="center">
  <!-- [![status](https://img.shields.io/badge/status-stable-blue.svg)](https://github.com/tauri-apps/tauri/tree/dev)
  [![License](https://img.shields.io/github/license/ajmcquilkin/meshtastic-network-management-client)](https://opencollective.com/tauri)
  ![GitHub issues](https://img.shields.io/github/issues/ajmcquilkin/meshtastic-network-management-client)
  [![website](https://img.shields.io/badge/website-meshtastic.org-green.svg)]([https://meshtastic.org](https://meshtastic.org/))
  [![support meshtastic](https://img.shields.io/badge/sponsor-Open%20Collective-blue.svg)](https://opencollective.com/meshtastic) -->
  
  <!--   <img alt="GitHub branch checks state" src="https://img.shields.io/github/checks-status/ajmcquilkin/meshtastic-network-management-client/main"> -->
  <a href="https://github.com/ajmcquilkin/Meshtastic-network-management-client/commits/main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ajmcquilkin/meshtastic-network-management-client">
  </a>
  
  <a href="https://github.com/ajmcquilkin/Meshtastic-network-management-client/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ajmcquilkin/meshtastic-network-management-client">
  </a>
  
  <a href="https://github.com/ajmcquilkin/Meshtastic-network-management-client/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/ajmcquilkin/meshtastic-network-management-client">
  </a>
  
  <a href="https://github.com/ajmcquilkin/Meshtastic-network-management-client">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/ajmcquilkin/meshtastic-network-management-client">
  </a>
  
  <a href="https://opencollective.com/meshtastic">
    <img alt="Open Collective backers" src="https://img.shields.io/opencollective/backers/meshtastic?label=support%20meshtastic">
  </a>
</p>

## :wave: Introduction

This application is an unofficial desktop client for the [Meshtastic Project](https://meshtastic.org/), designed to allow users to reliably manage large, decentralized mesh networks. Currently the Meshtastic client ecosystem has strong support for managing single nodes, but minimal support for network-level management and analysis. The goal of this project is to give users confidence in their Meshtastic networks as a reliable communications infrastructure through novel algorithmic analysis and connection-level insights.

![image](https://user-images.githubusercontent.com/46639306/230783389-330754f9-a1c3-4b8b-8db9-a226c612f011.png)

This application is built using the [Tauri Framework](https://tauri.app/), a modern, secure successor to the [Electron Framework](https://www.electronjs.org/). This allows us to natively support Linux, macOS, and Windows within the same codebase without the performance or memory overhead of a Chromium browser. Our core application infrastructure is written in Rust due to its performance and safety, and our UI and client functionality is written in React TypeScript using [Vite](https://vitejs.dev/). This project is in early stages of development, and as such is **not yet suitable for production use**.

## :rocket: Functionality

This project is still in early stages of development, but here's a rough roadmap of functionality we're working on. We're placing a high priority on getting our core infrastructure right, since this is the core of any robust and effective UI layer.

- [x] :link: Core dataflow infrastructure
  - [x] Serial data send/receive
  - [x] Rust protobuf integration (.proto -> .rs)
  - [x] Packet encode/decode
  - [x] Device state management
- [x] :art: Core UI infrastructure
  - [x] Tauri command management
  - [x] Tauri event management
  - [x] Redux saga dataflow
- [ ] :artificial_satellite: Network topology collection
  - [x] RFC for novel packet ([link](https://www.adammcquilkin.com/Adam_McQuilkin_-_Meshtastic_Network_Centralization_Proposal.pdf))
  - [x] MVP protobuf changes ([link](https://github.com/uhuruhashimoto/protobufs))
  - [x] MVP firmware changes ([link](https://github.com/uhuruhashimoto/firmware))
  - [ ] Community protobuf review
  - [ ] Community firmware review
- [ ] :nerd_face: Algorithmic analysis
  - [x] Infrastructure
    - [x] Network packet collation
    - [x] Network graph construction
    - [x] Algorithm runners
  - [ ] UI
    - [x] MVP algorithm runner pane
    - [ ] On-map algorithm UI
    - [ ] Automatic algorithm rerunning
- [ ] :radio: Node management
  - [x] Node peer table
  - [ ] Remote node configuration
- [ ] :pushpin: Waypoint management
  - [x] Managed waypoint table
  - [x] In-channel waypoint sending
  - [ ] On-map waypoint tooltip
- [ ] :globe_with_meridians: Web client parity (UI)
  - [x] Map node view
  - [x] Text messaging
  - [ ] Configuration
    - [ ] Device configuration
    - [ ] Module configuration
    - [ ] Channel configuration
- [ ] :mount_fuji: Offline map view
  - [ ] Offline map storage
  - [ ] Region-based downloading
- [ ] :page_facing_up: Network data export

<!-- - [ ] :earth_americas: Node in-map viewing
  - [x] Mapping service integration
  - [x] Node positioning on map
  - [ ] Offline map usage
- [x] :electric_plug: Rust serial management of base node
  - [x] Rust serialport integration
  - [x] Rust protobuf decoding/encoding
  - [x] Tauri event management
  - [x] Redux saga event integration
- [ ] :satellite: Messaging and channel management
  - [x] Redux store + saga setup
  - [ ] Channel management flows + UI
  - [x] Messaging UI
  - [ ] Local message backup
- [ ] :memo: Network onboarding and configuration flow
- [ ] :computer: Algorithmic network management
  - [x] Tauri command infrastructure
  - [ ] Graph initialization and management
  - [x] Algorithm implementations
  - [ ] Insight utility UI
- [ ] :floppy_disk: Management summary and export flow -->

## :computer: Development

### Prerequisites

This project is built in Rust and React TypeScript, and managed using the PNPM package manager. As such, this project requires the following programs to be installed on your development machine:

- [Rust Language](https://www.rust-lang.org/)
- [Node.js](https://nodejs.org/en/)
- [PNPM Package Manager](https://pnpm.io/installation)

### Installation

For the time being, the only way to run this project is to clone this repository. To do this, follow the steps below:

1. Ensure you have Rust, Node.js, and PNPM installed (see [Prerequisites](#prerequisites))
2. Clone this repositiory to a local directory. This can be done by running `git clone https://github.com/ajmcquilkin/meshtastic-network-management-client.git`
3. Recursively clone our Git submodules by running `git submodule update --init`
4. Install all required NPM packages with `pnpm i`
5. Once you have completed these steps, verify your installation with the `pnpm run rust:dev` command. The application should compile successfully, and you should see the application open successfully. If this process fails for you, please [let us know](https://github.com/ajmcquilkin/meshtastic-network-management-client/issues)!

### Recommended IDE Setup

While this project can be developed within any text editor, we recommend the [Visual Studio Code](https://code.visualstudio.com/) editor. If using VSCode, we strongly recommend that you install the following Visual Studio Code extensions. These extensions both enforce code style and enable language and framework support for our tech stack.

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Formatter for our UI code
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Linter for our UI code
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) - Rust LSP with code linting, formatting, and quality suggestions

Some optional extensions that aren't required but we find very helpful:

- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) - Adds Tauri [command](https://tauri.app/v1/guides/features/command/) snippets and configuration JSON validation
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - A helpful plugin for working with Git histories

### Development Commands

To standardize our development flow, we utilize PNPM commands, defined in `package.json`. These commands can be run with the `pnpm run NAME ...ARGS` syntax. Our commands are broken out into two primary categories, `rust:*` commands and `ui:*` commands. The `rust:*` commands run the entire desktop application, where the `ui:*` commands only run the UI layer.

> **Note:** We strongly recommend against using the `ui:dev` and `ui:build` commands manually. These commands are invoked internally by the `rust:dev` and `rust:build` commands, respectively. You will **not** be able to connect to a serial devce when running the `ui:dev` command, as this logic is not handled in the UI layer.

We are currently working to add support for the [Storybook](https://storybook.js.org/) framework, which will allow contributors to develop UI components without running the entire desktop application.

- `pnpm run rust:dev` - Starts the desktop application in development mode, allowing for hot reloading of UI and Rust code
- `pnpm run rust:build` - Builds the desktop application in production mode for your system architecture. Currently we only use this command for testing our application's CLI argument parser.
- `pnpm run rust:test` - Runs backend tests on the Rust codebase directory (`/src-tauri`). This command also generates TypeScript client bindings in the `/src-tauri/bindings` directory. Add `-- --show-output` to show Rust `println!` macro calls within test suites.

- `pnpm run ui:dev` - Starts the UI development server, allowing for UI development in a browser environment. Note that any code that interfaces with the Rust backend **will not function** within this browser environment, meaning you will be unable to connect to serial devices in this context
- `pnpm run ui:build`: - Runs a production build on the UI code into the `dist` directory
- `pnpm run ui:lint` - Uses ESLint to check for code style errors. Note that our CI pipeline requires that this command succeeds before any changes can be merged
- `pnpm run ui:format` - Formats the UI codebase using [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/). We strongly recommend you run this before creating a PR!
- `pnpm run ui:test` - Runs UI test suite using [Jest](https://jestjs.io/). Currently the project does not have a UI testing suite, but we're very open to contributions!
- ~~`pnpm run ui:preview` - Runs the built UI from the `dist` directory. This command must be run after `ui:build`~~ (deprecated)

> **Note:** On Linux, your user may not have permission to access a given serial port. If this happens, you will likely need to add your user to the group that controls the serial port you want to access. You can find the group that controls a serial port via the `ls -ld PATH_TO_PORT_HERE` command. You can add your user to this group via the `usermod -a -G GROUP_NAME_HERE $USER` command.

## :heart: Contributing

As we are still very early in development, we don't yet have a standardized framework for accepting contributions. This being said, we are very open to suggestions and/or code changes! If you're interested in contributing to this repository, we would ask that you first check our issue board to ensure your work isn't duplicating the work of others. Then, please make an issue on our board so we know what you're interested in working on. If you have any questions about the project, we would love to hear from you!
