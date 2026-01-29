#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}--- MariaDB Permission Fix Tool ---${NC}"

# 1. Stop Database
echo -e "${GREEN}1. Stopping Database Services...${NC}"
sudo systemctl stop mariadb || true
sudo systemctl stop mysql || true

# Force kill if still running
if pidof mysqld > /dev/null; then
    echo -e "${BLUE}Force killing mysqld processes...${NC}"
    sudo kill -9 $(pidof mysqld)
fi

# 2. Start in Safe Mode
echo -e "${GREEN}2. Starting MariaDB in Safe Mode...${NC}"
# We run it in background
sudo mysqld_safe --skip-grant-tables --skip-networking &
SAFE_PID=$!

echo -e "${BLUE}Waiting for MariaDB to start (10s)...${NC}"
sleep 10

# 3. Reset Permissions
echo -e "${GREEN}3. Resetting Root Permissions...${NC}"

# We use a heredoc to feed commands to mysql
# Note: In skip-grant-tables, we must FLUSH PRIVILEGES before GRANT works
sudo mysql -u root <<EOF
FLUSH PRIVILEGES;
-- Delete existing root to ensure clean slate
DROP USER IF EXISTS 'root'@'localhost';
-- Recreate root
CREATE USER 'root'@'localhost' IDENTIFIED BY 'password123';
-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
-- Flush again
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}Permissions reset successfully.${NC}"

# 4. Stop Safe Mode
echo -e "${GREEN}4. Stopping Safe Mode...${NC}"
# Try graceful shutdown first
sudo mysqladmin -u root -ppassword123 shutdown || sudo kill $SAFE_PID || sudo kill -9 $(pidof mysqld)
sleep 5

# 5. Start Normal Service
echo -e "${GREEN}5. Starting Normal Service...${NC}"
sudo systemctl start mariadb

# 6. Verify System Permissions
echo -e "${GREEN}6. Fixing System File Permissions...${NC}"
if [ -d "/var/lib/mysql" ]; then
    sudo chown -R mysql:mysql /var/lib/mysql
    sudo chmod -R 750 /var/lib/mysql
    echo "Fixed /var/lib/mysql permissions."
fi

# 7. Functional Test
echo -e "${GREEN}7. Running Functional Tests...${NC}"

echo -e "${BLUE}Test 1: Connection Check${NC}"
if mysql -u root -ppassword123 -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection successful"
else
    echo "❌ Connection failed"
    exit 1
fi

echo -e "${BLUE}Test 2: Check Grants${NC}"
mysql -u root -ppassword123 -e "SHOW GRANTS FOR 'root'@'localhost';"

echo -e "${BLUE}Test 3: CRUD Operations${NC}"
mysql -u root -ppassword123 <<EOF
CREATE DATABASE IF NOT EXISTS temp_perm_test;
USE temp_perm_test;
CREATE TABLE IF NOT EXISTS test (id INT);
INSERT INTO test VALUES (1);
DROP DATABASE temp_perm_test;
EOF
echo "✅ CRUD operations successful"

echo -e "${GREEN}-------------------------------------------${NC}"
echo -e "${GREEN}Database Permissions Fixed Successfully!${NC}"
echo -e "${GREEN}-------------------------------------------${NC}"
