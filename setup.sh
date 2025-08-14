#!/bin/bash

echo "FlowCraft AI - Setup Script"
echo "==========================="
echo

echo "Setting up FlowCraft AI..."

echo
echo "1. Setting up Python backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
echo "Activating virtual environment..."
source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Backend setup complete!"

echo
echo "2. Setting up Node.js frontend..."
cd ../frontend
echo "Installing dependencies..."
npm install
echo "Frontend setup complete!"

echo
echo "3. Environment configuration..."
cd ../backend
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your configuration"
fi

echo
echo "Setup complete!"
echo
echo "To start the application:"
echo "1. Backend: cd backend && source venv/bin/activate && python main.py"
echo "2. Frontend: cd frontend && npm run dev"
echo
echo "Access the app at: http://localhost:3000"
