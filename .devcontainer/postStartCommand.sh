#!/bin/bash

git submodule update --init || echo "no submodules to update"

pip3 install --upgrade "meshtastic[cli]" --break-system-packages -q

nohup meshtasticd -c .devcontainer/config.yaml > nohup-meshtasticd.out &

pnpm i
pnpm run rust:dev
