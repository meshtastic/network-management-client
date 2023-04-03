![image](https://user-images.githubusercontent.com/46639306/229531059-2f07b9c1-982f-4eaa-aae7-b8663e1e94a5.png)

<div align="center">
  <h1 align="center">Meshtastic Network Management Client</h1>
  <p align="center">An unofficial Meshtastic desktop client, allowing simple, offline deployment and administration of a mesh communication network.</p>
</div>

<p align="center">
  <!-- [![status](https://img.shields.io/badge/status-stable-blue.svg)](https://github.com/tauri-apps/tauri/tree/dev)
  [![License](https://img.shields.io/github/license/ajmcquilkin/meshtastic-emergency-response-client)](https://opencollective.com/tauri)
  ![GitHub issues](https://img.shields.io/github/issues/ajmcquilkin/meshtastic-emergency-response-client)
  [![website](https://img.shields.io/badge/website-meshtastic.org-green.svg)]([https://meshtastic.org](https://meshtastic.org/))
  [![support meshtastic](https://img.shields.io/badge/sponsor-Open%20Collective-blue.svg)](https://opencollective.com/meshtastic) -->
  
  <!--   <img alt="GitHub branch checks state" src="https://img.shields.io/github/checks-status/ajmcquilkin/meshtastic-emergency-response-client/main"> -->
  <a href="https://github.com/ajmcquilkin/Meshtastic-emergency-response-client/commits/main">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/ajmcquilkin/meshtastic-emergency-response-client">
  </a>
  
  <a href="https://github.com/ajmcquilkin/Meshtastic-emergency-response-client/blob/main/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/ajmcquilkin/meshtastic-emergency-response-client">
  </a>
  
  <a href="https://github.com/ajmcquilkin/Meshtastic-emergency-response-client/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/ajmcquilkin/meshtastic-emergency-response-client">
  </a>
  
  <a href="https://github.com/ajmcquilkin/Meshtastic-emergency-response-client">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/ajmcquilkin/meshtastic-emergency-response-client">
  </a>
  
  <a href="https://opencollective.com/meshtastic">
    <img alt="Open Collective backers" src="https://img.shields.io/opencollective/backers/meshtastic?label=support%20meshtastic">
  </a>
</p>

## Introduction

<!-- > :bangbang: **This application is in early alpha development. For the time being, all images shown in this README are Figma designs and are likely not implemented. We will update this README when this functionality is implemented.** :bangbang: -->

This application is an unofficial desktop client for the [Meshtastic Project](https://meshtastic.org/), with the goal of allowing emergency response workers to deploy and manage an off-grid mesh network. Currently, many emergency response teams utilize UHF/VHF analog radios, and while reliable, cannot reliably transmit vital data over long distances (GPS waypoints, regions of interest, etc). Our goal is to allow response coordinators to purchase [cheap, off-shelf radio hardware](https://meshtastic.org/docs/supported-hardware) and quickly and reliably use that hardware to communicate this vital response information.

This application is built using the [Tauri Framework](https://tauri.app/), a modern, secure successor to the [Electron Framework](https://www.electronjs.org/). This allows us to natively support Linux, macOS, and Windows within the same codebase without the performance or memory overhead of a Chromium browser. Our core application infrastructure is written in Rust, and UI and client functionality is written in React TypeScript and bundled using [Vite](https://vitejs.dev/). This project is in early stages of development, and as such is not yet suitable for production use.

<!-- ![image](https://user-images.githubusercontent.com/46639306/197882383-e993add8-0900-4114-9cb6-9e9cb4d331d4.png) -->

![image](https://user-images.githubusercontent.com/46639306/206596246-0619edd5-7303-4fad-81f0-8c84263016b1.png)

## Features

This project is in early stages of development, but here's a rough roadmap of functionality we're working on.

- [ ] :earth_americas: Node in-map viewing
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
- [ ] :floppy_disk: Management summary and export flow

## Development

### Prerequisites

This project is built in Rust and React TypeScript, and managed using the PNPM package manager. As such, this project requires the following programs to be installed on your development machine:

- [Rust Language](https://www.rust-lang.org/)
- [Node.js](https://nodejs.org/en/)
- [PNPM Package Manager](https://pnpm.io/installation)

Additionally, this project uses [Git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to include the [meshtastic/protobufs](https://github.com/meshtastic/protobufs) repository. To install this submodule, run `git submodule update --init` after cloning this repository.

### Recommended IDE Setup

While this project can be developed within any text editor, we recommend the [Visual Studio Code](https://code.visualstudio.com/) editor. If using VSCode, we strongly recommend that you install the following Visual Studio Code extensions. These extensions both enforce code style and enable language and framework support for our tech stack.

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) (optional)

### Commands

To standardise and simplify our development flow, we utilize PNPM commands (defined in `package.json`). We have created commands which allow for the development of the client only, or development of the client embeddeded in a desktop application window. We support running the application UI in a browser in the event that a contributor wants to make UI changes but is unable to install the required project dependences, although we strongly recommend developing using the `rust:*` commands. You will be unable to connect to a serial device when developing in-browser. Project dependencies can be installed with `pnpm i`.

> **Reminder:** When using any `rust:*` command, you will need to have the `src-tauri/protobufs` git submodule initialized. To do so, run `git submodule update --init` in the root of the project.

- `pnpm run ui:dev` - Starts the UI development server, allowing for UI development in a browser environment. Note that any code that interfaces with the Rust backend **will not function** within this browser environment, meaning you will be unable to connect to serial devices in this context
- `pnpm run ui:build`: - Runs a production build on the UI code into the `dist` directory
- `pnpm run ui:preview` - Runs the built UI from the `dist` directory. This command must be run after `ui:build`
- `pnpm run ui:format` - Formats the UI codebase using [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/)
- `pnpm run ui:test` - Runs UI test suite using [Jest](https://jestjs.io/)
- `pnpm run rust:dev` - Starts the desktop application in development mode, allowing for hot reloading of UI and Rust code
- `pnpm run rust:test` - Runs backend tests on the Rust codebase directory (`/src-tauri`). This command also generates TypeScript client bindings in the `/src-tauri/bindings` directory. Add `-- --show-output` to show Rust `println!` macro calls within test suites.

> **Note:** On Linux, your user may not have permission to access a given serial port. If this happens, you will likely need to add your user to the group that controls the serial port you want to access. You can find the group that controls a serial port via the `ls -ld PATH_TO_PORT_HERE` command. You can add your user to this group via the `usermod -a -G GROUP_NAME_HERE $USER` command.

## Contributing

As we are still very early in development, we don't yet have a standardized framework for accepting contributions. This being said, we are very open to suggestions and/or code changes! If you're interested in contributing to this repository, we would ask that you first check our issue board to ensure your work isn't duplicating the work of others. Then, please make an issue on our board so we know what you're interested in working on. If you have any questions about the project, we would love to hear from you!
