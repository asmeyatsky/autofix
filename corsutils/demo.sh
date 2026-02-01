#!/bin/bash

# CORS Utils Demo Script
# Demonstrates various CORS troubleshooting scenarios

echo "🔧 CORS Utils - Cross-Origin Resource Sharing Troubleshooting Demo"
echo "================================================================"

# Ensure we're in the right directory
cd "$(dirname "$0")"

echo "📋 Available commands:"
echo "1. List supported server types"
echo "2. Generate Express.js configuration"
echo "3. Generate Next.js configuration"
echo "4. Test CORS on a public API"
echo "5. Analyze frontend/backend CORS setup"
echo "6. Run comprehensive test suite"
echo "7. Interactive troubleshooting wizard"

echo ""
read -p "Choose a demo (1-7): " choice

case $choice in
  1)
    echo "🔍 Listing supported server types..."
    node dist/cli.js list
    ;;
    
  2)
    echo "⚙️ Generating Express.js CORS configuration..."
    node dist/cli.js config express --origins "http://localhost:3000,https://myapp.com"
    ;;
    
  3)
    echo "⚙️ Generating Next.js CORS configuration..."
    node dist/cli.js config next --origins "http://localhost:3000,https://myapp.com"
    ;;
    
  4)
    echo "🌐 Testing CORS on httpbin.org (CORS-enabled API)..."
    node dist/cli.js test https://httpbin.org/cors --methods "GET,POST,PUT"
    ;;
    
  5)
    echo "🔍 Analyzing CORS setup (frontend: localhost:3000, backend: localhost:8000)..."
    node dist/cli.js analyze http://localhost:3000 http://localhost:8000
    ;;
    
  6)
    echo "🧪 Running CORS test suite on httpbin.org..."
    node dist/cli.js suite https://httpbin.org/cors
    ;;
    
  7)
    echo "🧙 Starting interactive troubleshooting wizard..."
    echo "Note: This will prompt you for information about your setup"
    node dist/cli.js interactive
    ;;
    
  *)
    echo "❌ Invalid choice. Please run again and choose 1-7."
    exit 1
    ;;
esac

echo ""
echo "✅ Demo completed!"
echo ""
echo "💡 Quick examples for your own use:"
echo "  corsutils test http://localhost:8000/api"
echo "  corsutils analyze http://localhost:3000 http://localhost:8000"
echo "  corsutils config fastify --origins 'http://localhost:3000'"
echo "  corsutils diagnose http://localhost:8000/api http://localhost:8000/auth"
echo ""
echo "📖 For more help: corsutils --help"