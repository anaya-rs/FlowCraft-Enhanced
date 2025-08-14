#!/bin/bash

# =============================================================================
# FLOWCRAFT AI SETUP SCRIPT
# =============================================================================

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python_version() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
        
        if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 9 ]; then
            print_success "Python $PYTHON_VERSION found"
            return 0
        else
            print_error "Python 3.9+ required, found $PYTHON_VERSION"
            return 1
        fi
    else
        print_error "Python 3 not found"
        return 1
    fi
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
        
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js $NODE_VERSION found"
            return 0
        else
            print_error "Node.js 18+ required, found $NODE_VERSION"
            return 1
        fi
    else
        print_error "Node.js not found"
        return 1
    fi
}

# Function to setup backend
setup_backend() {
    print_status "Setting up FlowCraft AI Backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating environment configuration..."
        cp env.example .env
        print_warning "Please edit .env file with your configuration"
    fi
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p uploads exports logs temp
    
    # Initialize database
    print_status "Initializing database..."
    python init_db.py
    
    cd ..
    print_success "Backend setup completed!"
}

# Function to setup frontend
setup_frontend() {
    print_status "Setting up FlowCraft AI Frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create necessary directories
    print_status "Creating necessary directories..."
    mkdir -p public src/assets src/styles
    
    cd ..
    print_success "Frontend setup completed!"
}

# Function to setup development environment
setup_dev() {
    print_status "Setting up development environment..."
    
    # Install development tools
    if command_exists pip; then
        print_status "Installing development tools..."
        pip install black flake8 mypy pytest pytest-asyncio httpx
    fi
    
    # Install frontend development tools
    if command_exists npm; then
        print_status "Installing frontend development tools..."
        cd frontend
        npm install --save-dev @types/node
        cd ..
    fi
    
    print_success "Development environment setup completed!"
}

# Function to start services
start_services() {
    print_status "Starting FlowCraft AI services..."
    
    # Start backend
    print_status "Starting backend server..."
    cd backend
    source venv/bin/activate
    python main.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 5
    
    # Check if backend is running
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend is running on http://localhost:8000"
    else
        print_error "Backend failed to start"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend development server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 10
    
    # Check if frontend is running
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running on http://localhost:3000"
    else
        print_error "Frontend failed to start"
        exit 1
    fi
    
    print_success "All services are running!"
    print_status "Backend: http://localhost:8000"
    print_status "Frontend: http://localhost:3000"
    print_status "API Docs: http://localhost:8000/docs"
    
    # Wait for user to stop services
    echo
    print_status "Press Ctrl+C to stop all services"
    trap "stop_services" INT
    
    # Keep script running
    wait
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    print_success "Services stopped"
    exit 0
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    if [ -d "backend" ]; then
        print_status "Running backend tests..."
        cd backend
        source venv/bin/activate
        python -m pytest -v
        cd ..
    fi
    
    # Frontend tests
    if [ -d "frontend" ]; then
        print_status "Running frontend tests..."
        cd frontend
        npm test
        cd ..
    fi
    
    print_success "Tests completed!"
}

# Function to build for production
build_production() {
    print_status "Building for production..."
    
    # Build frontend
    if [ -d "frontend" ]; then
        print_status "Building frontend..."
        cd frontend
        npm run build
        cd ..
    fi
    
    # Build backend (if needed)
    if [ -d "backend" ]; then
        print_status "Backend is ready for production"
    fi
    
    print_success "Production build completed!"
}

# Function to show help
show_help() {
    echo "FlowCraft AI Setup Script"
    echo
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  setup           Setup FlowCraft AI (backend + frontend)"
    echo "  backend         Setup only backend"
    echo "  frontend        Setup only frontend"
    echo "  dev             Setup development environment"
    echo "  start           Start all services"
    echo "  test            Run tests"
    echo "  build           Build for production"
    echo "  docker          Setup with Docker"
    echo "  help            Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup        # Complete setup"
    echo "  $0 start        # Start services"
    echo "  $0 test         # Run tests"
}

# Function to setup Docker
setup_docker() {
    print_status "Setting up FlowCraft AI with Docker..."
    
    if ! command_exists docker; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose not found. Please install Docker Compose first."
        exit 1
    fi
    
    # Build and start services
    print_status "Building and starting Docker services..."
    docker-compose up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check services
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend is running on http://localhost:8000"
    else
        print_warning "Backend may still be starting up"
    fi
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running on http://localhost:3000"
    else
        print_warning "Frontend may still be starting up"
    fi
    
    print_success "Docker setup completed!"
    print_status "Use 'docker-compose logs -f' to view logs"
    print_status "Use 'docker-compose down' to stop services"
}

# Main script logic
main() {
    case "${1:-setup}" in
        "setup")
            # Check prerequisites
            print_status "Checking prerequisites..."
            check_python_version || exit 1
            check_node_version || exit 1
            
            # Setup both backend and frontend
            setup_backend
            setup_frontend
            setup_dev
            
            print_success "FlowCraft AI setup completed!"
            print_status "Run '$0 start' to start the services"
            ;;
        "backend")
            check_python_version || exit 1
            setup_backend
            ;;
        "frontend")
            check_node_version || exit 1
            setup_frontend
            ;;
        "dev")
            setup_dev
            ;;
        "start")
            start_services
            ;;
        "test")
            run_tests
            ;;
        "build")
            build_production
            ;;
        "docker")
            setup_docker
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
