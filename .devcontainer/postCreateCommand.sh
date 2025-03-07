#!/bin/bash

sudo chown -R vscode /workspaces

# Install meshtasticd
echo 'deb http://download.opensuse.org/repositories/network:/Meshtastic:/beta/Debian_12/ /' | sudo tee /etc/apt/sources.list.d/network:Meshtastic:beta.list
curl -fsSL https://download.opensuse.org/repositories/network:Meshtastic:beta/Debian_12/Release.key | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/network_Meshtastic_beta.gpg > /dev/null
sudo apt update && sudo apt install meshtasticd -y

sudo cp /etc/meshtasticd/available.d/lora-MeshAdv-900M30S.yaml /etc/meshtasticd/config.d/
nohup meshtasticd > nohup-meshtasticd.out &
