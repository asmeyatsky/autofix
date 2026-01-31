#!/bin/bash

# AutoFix Demo Script
# This script demonstrates the AutoFix CLI tool

echo "🔧 AutoFix Demo - Automated Frontend Debugger"
echo "=========================================="
echo ""

# Install http-server for the demo app
echo "📦 Installing demo dependencies..."
cd examples && npm install > /dev/null 2>&1

# Start the demo server in background
echo "🚀 Starting demo server on http://localhost:3000..."
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "✅ Demo server started!"
echo ""

# Show what errors exist in the demo
echo "🐛 Demo app contains intentional errors:"
echo "  - Undefined userId causing fetch errors"
echo "  - Missing error handling for undefined data"
echo "  - No null checks for array operations"
echo ""

# Run AutoFix
echo "🤖 Running AutoFix to detect and fix errors..."
cd ..
node dist/cli.js --url http://localhost:3000 --project ./examples --max-attempts 3

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "📋 Summary:"
echo "  - AutoFix monitored the frontend startup"
echo "  - Detected errors in console and network requests"
echo "  - Used LLM to analyze and generate fixes"
echo "  - Applied fixes automatically"
echo "  - Continued until frontend started successfully"
echo ""
echo "💡 Try running 'autofix --help' to see all options"