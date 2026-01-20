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

# 3. Install System Services (MariaDB, Redis, Nginx) - Native Installation (No Docker)
echo -e "${GREEN}3. Installing System Services (MariaDB, Redis, Nginx)...${NC}"

# Install Redis
if ! command -v redis-server &> /dev/null; then
    echo -e "${BLUE}Installing Redis...${NC}"
    sudo apt-get install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
else
    echo -e "${BLUE}Redis is already installed. Skipping.${NC}"
fi

# Install MariaDB
if ! command -v mariadb &> /dev/null; then
    echo -e "${BLUE}Installing MariaDB...${NC}"
    sudo apt-get install -y mariadb-server libmariadb-dev
    sudo systemctl enable mariadb
    sudo systemctl start mariadb
    
    # Secure installation (automated)
    echo -e "${BLUE}Configuring MariaDB...${NC}"
    # Set root password if not set (this is a basic setup, assumes fresh install)
    # We will rely on the user providing the password in the setup step to match what they configure here manually or we default it.
    # For a truly automated script, we might need to pre-seed the password, but interactive is safer for now or assume password123 for dev/demo.
    
    # Create database if not exists
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS vantus;"
    # Create root user with password if not exists (or update) - simplifying for script
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password123'; FLUSH PRIVILEGES;"
else
    echo -e "${BLUE}MariaDB is already installed. Skipping.${NC}"
fi

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${BLUE}Installing Nginx...${NC}"
    sudo apt-get install -y nginx
    sudo systemctl stop nginx # We will let PM2 or our service manage it, or just use it as the edge proxy
    # For Vantus, we want Nginx running, but configured by our renderer.
    # We'll enable it but ensure the config dir is writable by our user or renderer service.
else
    echo -e "${BLUE}Nginx is already installed. Skipping.${NC}"
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

# 6. Start Infrastructure (Skipped - Services running natively via systemd)
echo -e "${GREEN}6. Verifying Infrastructure...${NC}"
# We assume MariaDB and Redis are running via systemd from step 3.

# 7. Seed Database (Idempotent)
echo -e "${GREEN}7. Seeding Database...${NC}"
# Ensure we use localhost for DB connection since we are baremetal
# We might need to override the .env file if it was generated with docker hostnames
# But setup-env.js usually defaults to localhost if not specified or we can force it.

# Force localhost in .env for baremetal
sed -i 's/mariadb:3306/localhost:3306/g' database/.env
sed -i 's/redis:6379/localhost:6379/g' database/.env
sed -i 's/mariadb:3306/localhost:3306/g' apps/control-plane/.env
sed -i 's/redis:6379/localhost:6379/g' apps/control-plane/.env
sed -i 's/mariadb:3306/localhost:3306/g' services/config-renderer/.env

npm run seed --workspace=database

# 8. Start Apps via PM2
echo -e "${GREEN}8. Starting Applications via PM2...${NC}"
# We need to make sure Nginx config dir permissions are correct for the current user
# Config Renderer needs to write to /etc/nginx/conf.d
echo -e "${BLUE}Configuring Nginx permissions...${NC}"
sudo chown -R $USER:$USER /etc/nginx/conf.d
sudo chmod -R 755 /etc/nginx/conf.d

pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}-------------------------------------------------------${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}-------------------------------------------------------${NC}"
echo -e "Control Plane: http://localhost:3000"
echo -e "Grafana:       (Not installed in baremetal mode - install separately if needed)"
echo -e "${BLUE}To view logs: pm2 logs${NC}"
echo -e "${BLUE}To manage apps: pm2 status${NC}"
