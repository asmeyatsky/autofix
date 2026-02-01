#!/bin/bash

# AutoFix Quick Test Script
# Run this to quickly test AutoFix functionality

echo "🚀 AutoFix Quick Test"
echo "===================="
echo ""

# Check if AutoFix is installed
if ! command -v autofix &> /dev/null; then
    echo "❌ AutoFix is not installed or not in PATH"
    echo ""
    echo "Please install AutoFix first:"
    echo "  git clone https://github.com/asmeyatsky/autofix.git"
    echo "  cd autofix"
    echo "  npm install"
    echo "  npm run build"
    echo "  npm install -g ."
    echo ""
    exit 1
fi

echo "✅ AutoFix found: $(which autofix)"
echo ""

# Check if LLM API key is set
if [ -z "$AUTOFIX_LLM_API_KEY" ]; then
    echo "⚠️  Warning: AUTOFIX_LLM_API_KEY is not set"
    echo ""
    echo "Set your OpenAI API key:"
    echo "  export AUTOFIX_LLM_API_KEY=\"sk-your-api-key-here\""
    echo ""
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! $response =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if demo app is already running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Demo server is already running on http://localhost:3000"
else
    echo "🚀 Starting demo server..."
    
    # Start the demo server
    cd examples
    npm install > /dev/null 2>&1
    npm run dev > /dev/null 2>&1 &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..10}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Demo server started!"
            break
        fi
        sleep 2
        echo "   Waiting... ($i/10)"
    done
    
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ Failed to start demo server"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
fi

echo ""
echo "🤖 Running AutoFix test..."
echo "=============================="
echo ""

# Run AutoFix with conservative settings
autofix \
    --url http://localhost:3000 \
    --project ./examples \
    --max-attempts 2 \
    --timeout 15000 \
    --headless

# Clean up
if [ ! -z "$SERVER_PID" ]; then
    echo ""
    echo "🧹 Cleaning up demo server..."
    kill $SERVER_PID 2>/dev/null || true
fi

echo ""
echo "🎉 Test complete!"
echo ""
echo "To use AutoFix with your own project:"
echo "  1. Start your development server"
echo "  2. Set your API key: export AUTOFIX_LLM_API_KEY=\"your-key\""
echo "  3. Run: autofix --url http://localhost:YOUR-PORT --project ./src"
echo ""
echo "For more options: autofix --help"