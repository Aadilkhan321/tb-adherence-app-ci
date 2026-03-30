#!/bin/bash
# TB Adherence App - Quick Setup Script for Unix/Linux/macOS
# Run this script to set up the project quickly

echo "🏥 TB Adherence App - Quick Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

# Check if npm is installed
echo -e "${YELLOW}Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm $NPM_VERSION found${NC}"
else
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

# Install root dependencies
echo -e "${YELLOW}Installing root dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Root dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install root dependencies${NC}"
    exit 1
fi

# Install client dependencies
echo -e "${YELLOW}Installing client dependencies...${NC}"
cd client
if npm install; then
    echo -e "${GREEN}✅ Client dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install client dependencies${NC}"
    exit 1
fi
cd ..

# Install server dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
cd server
if npm install; then
    echo -e "${GREEN}✅ Server dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install server dependencies${NC}"
    exit 1
fi
cd ..

# Copy environment file
echo -e "${YELLOW}Setting up environment configuration...${NC}"
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo -e "${GREEN}✅ Created server/.env from template${NC}"
else
    echo -e "${GREEN}✅ Environment file already exists${NC}"
fi

# Make the script executable for future runs
chmod +x setup.sh

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}==================${NC}"
echo ""
echo -e "${CYAN}📋 Demo Credentials:${NC}"
echo -e "${WHITE}   Patient: patient@demo.com / password123${NC}"
echo -e "${WHITE}   Doctor: doctor@demo.com / password123${NC}"
echo ""
echo -e "${CYAN}🚀 To start the application:${NC}"
echo -e "${WHITE}   npm run dev${NC}"
echo ""
echo -e "${CYAN}🌐 URLs:${NC}"
echo -e "${WHITE}   Frontend: http://localhost:3000${NC}"
echo -e "${WHITE}   Backend:  http://localhost:5000/api/health${NC}"
echo ""
echo -e "${CYAN}📖 For more information, see README.md${NC}"