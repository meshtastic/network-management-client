FROM mcr.microsoft.com/devcontainers/base:bookworm

USER root

ENV NODE_ENV=development

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    file \
    git \
    gnupg2 \
    gpg \
    libappindicator3-dev \
    libayatana-appindicator3-dev \
    libgtk-3-dev \
    librsvg2-dev \
    libssl-dev \
    libsoup2.4-dev \
    libwebkit2gtk-4.0-dev \
    patchelf \
    python3-pip \
    usbutils \
    wget \
    zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

USER vscode

RUN echo 'export DISPLAY="${DISPLAY:-:1}"' | tee -a ~/.bashrc >> ~/.zshrc

HEALTHCHECK NONE