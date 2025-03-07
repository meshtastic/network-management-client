#!/bin/bash

git submodule update --init || echo "no submodules to update"

pip3 install --upgrade "meshtastic[cli]" --break-system-packages -q

pnpm i
pnpm run rust:dev
