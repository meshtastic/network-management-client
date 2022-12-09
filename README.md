![image](https://user-images.githubusercontent.com/46639306/206589911-37289193-1b7f-441b-81c4-68304b0c55b2.png)

<div align="center">
  <h1 align="center">Meshtastic Emergency Response Client</h1>
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

This application is a desktop client for the [Meshtastic](https://meshtastic.org/) mesh networking project intended for use in offline disaster response scenarios (e.g., missing person, fire response, etc...). This client is still in early alpha development, so feedback is very welcome! Feel free to drop an issue :)

This project uses the [Tauri](https://tauri.app/) framework, which uses the native OS webview to render a web UI within a native Rust application window.

> ℹ️ **This image is a conceptual design and is not yet fully implemented.** ℹ️

<!-- ![image](https://user-images.githubusercontent.com/46639306/197882383-e993add8-0900-4114-9cb6-9e9cb4d331d4.png) -->
![image](https://user-images.githubusercontent.com/46639306/206596246-0619edd5-7303-4fad-81f0-8c84263016b1.png)

## Development Prerequisites

This project requires the following programs to be installed to develop for this application:

- [Rust Language](https://www.rust-lang.org/)
- [Node.js](https://nodejs.org/en/)
- [PNPM Package Manager](https://pnpm.io/installation)

Additionally, this project uses [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules). This means you will need to run `git submodule update --init` after cloning the repository.

## Recommended IDE Setup

We recommend the following Visual Studio Code extensions for developing on this codebase.

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)

## Commands

The following commands can be used to develop on this codebase. Note that it is possible to run the UI within a browser outside of the Rust application window, which is useful for developing UI code. This can be done with the `ui:*` commands. Dependencies can be installed with `pnpm i`.

- `pnpm run ui:dev` - Starts the UI development server, allowing for UI development in a browser environment. Note that any code that interfaces with the Rust backend **will not function** within this browser environment
- `pnpm run ui:build`: - Runs a production build on the UI code into the `dist` directory
- `pnpm run ui:preview` - Runs the built UI from the `dist` directory. This command must be run after `ui:build`
- `pnpm run ui:format` - Formats the UI codebase using [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/)
- `pnpm run ui:test` - Runs UI test suite using [Jest](https://jestjs.io/)
- `pnpm run rust:dev` - Starts the desktop application in development mode, allowing for hot reloading of UI and Rust code
- `pnpm run rust:test` - Runs backend tests on the Rust codebase directory (`/src-tauri`) Add `-- --show-output` to show printlns.
