FROM mcr.microsoft.com/devcontainers/typescript-node:1.1-22

# Install Xvfb
RUN apt-get update 
RUN apt-get install -y \
    xvfb \
    libpango1.0-dev \
    libgtk-3-dev \
    libwebkit2gtk-4.0-dev \
    libappindicator3-dev \
    librsvg2-dev

# Set up Xvfb
ENV DISPLAY=:99
RUN Xvfb :99 -screen 0 1024x768x16 &