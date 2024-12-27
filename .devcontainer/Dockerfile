FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install necessary packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR ${LOCAL_WORKSPACE_FOLDER}