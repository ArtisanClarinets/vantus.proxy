#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}--- Vantus Proxy Baremetal Installer (Ubuntu 22.04) ---${NC}"

# 1. System Updates & Dependencies
echo -e "${GREEN}1. Updating system and installing dependencies...${NC}"
sudo apt-get update
sudo apt-get install -y curl git build-essential

# 2. Install Node.js 20
if ! command -v node &> /dev/null; then
    echo -e "${GREEN}2. Installing Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${BLUE}Node.js is already installed. Skipping.${NC}"
fi

# 3. Install Docker (for backing services)
if ! command -v docker &> /dev/null; then
    echo -e "${GREEN}3. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${BLUE}Note: You may need to re-login for Docker group changes to take effect.${NC}"
else
    echo -e "${BLUE}Docker is already installed. Skipping.${NC}"
fi

# 4. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${GREEN}4. Installing PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${BLUE}PM2 is already installed. Skipping.${NC}"
fi

# 5. Project Setup
echo -e "${GREEN}5. Setting up Vantus Proxy Project...${NC}"
# Assuming we are in the project root or just cloned it.
# If this script is run from inside the repo, we proceed.
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}Installing NPM dependencies...${NC}"
npm install

echo -e "${BLUE}Running Project Setup (Environment Variables)...${NC}"
# This is interactive.
npm run postinstall

echo -e "${BLUE}Building Project...${NC}"
npm run build

# 6. Start Infrastructure
echo -e "${GREEN}6. Starting Infrastructure (Database, Redis, Observability)...${NC}"
cd infra/docker
# Check if .env exists, if not, copy from generated or let setup-env.js handle it
# setup-env.js writes to infra/docker/.env, so we are good.
sudo docker compose up -d --remove-orphans
cd ../..

# Wait for DB?
echo -e "${BLUE}Waiting for services to be ready (10s)...${NC}"
sleep 10

# 7. Seed Database (Idempotent)
echo -e "${GREEN}7. Seeding Database...${NC}"
npm run seed --workspace=database

# 8. Start Apps via PM2
echo -e "${GREEN}8. Starting Applications via PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}-------------------------------------------------------${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}-------------------------------------------------------${NC}"
echo -e "Control Plane: http://localhost:3000"
echo -e "Grafana:       http://localhost:3002 (admin/admin)"
echo -e "${BLUE}To view logs: pm2 logs${NC}"
echo -e "${BLUE}To manage apps: pm2 status${NC}"
