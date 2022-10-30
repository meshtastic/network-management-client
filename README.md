# Meshtastic Emergency Response Client

This application is a desktop client for the [Meshtastic](https://meshtastic.org/) mesh networking project intended for use in offline disaster response scenarios (e.g., missing person, fire response, etc...). This client is still in early alpha development, so feedback is very welcome! Feel free to drop an issue :)

This project uses the [Tauri](https://tauri.app/) framework, which uses the native OS webview to render a web UI within a native Rust application window.

![image](https://user-images.githubusercontent.com/46639306/197882383-e993add8-0900-4114-9cb6-9e9cb4d331d4.png)


## Development Prerequisites

This project requires the following programs to be installed to develop for this application:

- [Rust Language](https://www.rust-lang.org/)
- [Node.js](https://nodejs.org/en/)
- [PNPM Package Manager](https://pnpm.io/installation)

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
- `pnpm run rust:test` - Runs backend tests on the Rust codebase directory (`/src-tauri`)
