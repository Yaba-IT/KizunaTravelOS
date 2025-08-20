#!/bin/bash

# Kizuna Travel OS ERP API - Quick Start Script
# This script sets up the ERP API for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}  Kizuna Travel OS ERP API${NC}"
    echo -e "${BLUE}  Quick Start Setup${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "This script must be run from the erp-api directory"
    exit 1
fi

print_header

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    print_warning "Yarn is not installed. Installing Yarn..."
    npm install -g yarn
    print_success "Yarn installed successfully"
else
    print_success "Yarn $(yarn --version) detected"
fi

# Check if MongoDB is running
print_status "Checking MongoDB connection..."
if ! command -v mongosh &> /dev/null; then
    print_warning "MongoDB client not found. Please ensure MongoDB is running on localhost:27017"
else
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "MongoDB is running and accessible"
    else
        print_warning "MongoDB is not accessible. Please start MongoDB service"
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
yarn install
print_success "Dependencies installed successfully"

# Create environment file
if [ ! -f ".env" ]; then
    print_status "Creating environment file..."
    if [ -f "env.template" ]; then
        cp env.template .env
        print_success "Environment file created from template"
        print_warning "Please edit .env file with your configuration before starting"
    else
        print_warning "env.template not found. Please create .env file manually"
    fi
else
    print_success "Environment file already exists"
fi

# Create logs directory
if [ ! -d "logs" ]; then
    print_status "Creating logs directory..."
    mkdir -p logs
    print_success "Logs directory created"
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    print_status "Creating uploads directory..."
    mkdir -p uploads
    print_success "Uploads directory created"
fi

# Run validation
print_status "Running system validation..."
if yarn validate; then
    print_success "System validation passed"
else
    print_error "System validation failed. Please check the errors above."
    exit 1
fi

print_header
print_success "Setup completed successfully!"
echo ""
print_status "Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Ensure MongoDB is running"
echo "  3. Start the API with: yarn dev (development) or yarn start (production)"
echo ""
print_status "Available commands:"
echo "  yarn dev          - Start in development mode with auto-reload"
echo "  yarn start        - Start in production mode"
echo "  yarn validate     - Run system validation"
echo "  yarn test         - Run tests"
echo "  yarn lint         - Run linting"
echo ""
print_status "API will be available at: http://localhost:3000"
print_status "Health check: http://localhost:3000/health"
echo ""
print_success "Happy coding! 🚀"
