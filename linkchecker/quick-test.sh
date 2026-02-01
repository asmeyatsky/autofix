#!/bin/bash

# Quick LinkChecker Test Script
# Creates a simple test site and runs LinkChecker

echo "🔗 LinkChecker Quick Test"
echo "========================"
echo ""

# Create a simple test site
echo "📁 Creating test site..."
mkdir -p test-site
cd test-site

# Create main page
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Test Site</title>
</head>
<body>
    <h1>Test Site for LinkChecker</h1>
    <nav>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
        <a href="/broken-page.html">Broken Link</a>
        <a href="https://httpstat.us/404">External 404</a>
        <a href="https://google.com">External Valid</a>
    </nav>
    <p>This is a test site for LinkChecker.</p>
</body>
</html>
EOF

# Create valid pages
echo "About page" > about.html
echo "<p><a href='/'>Home</a></p>" >> about.html

echo "Contact page" > contact.html  
echo "<p><a href='/'>Home</a></p>" >> contact.html

cd ..

echo "✅ Test site created in ./test-site/"
echo ""

# Start HTTP server
echo "🚀 Starting HTTP server on port 8081..."
cd test-site
python3 -m http.server 8081 > /dev/null 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server
echo "⏳ Waiting for server..."
sleep 3

# Test LinkChecker
echo "🔗 Testing LinkChecker..."
echo "======================"
echo ""

# Test 1: Summary only
echo "1️⃣ Summary mode:"
linkchecker http://localhost:8081 --summary --max-pages 3
echo ""

# Test 2: Dead links only
echo "2️⃣ Dead links only:"
linkchecker http://localhost:8081 --dead-only --max-pages 3
echo ""

# Test 3: JSON output
echo "3️⃣ JSON output:"
linkchecker http://localhost:8081 --format json --output test-results.json --max-pages 3
echo ""

# Show results
if [ -f test-results.json ]; then
    echo "📊 JSON Results:"
    echo "   Total pages: $(node -pe 'JSON.parse(require("fs").readFileSync("test-results.json")).stats.totalPages')"
    echo "   Links checked: $(node -pe 'JSON.parse(require("fs").readFileSync("test-results.json")).stats.checkedLinks'"
    echo "   Dead links: $(node -pe 'JSON.parse(require("fs").readFileSync("test-results.json")).stats.deadLinks'"
fi

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
rm -rf test-site test-results.json

echo ""
echo "🎉 LinkChecker test complete!"
echo ""
echo "To use LinkChecker on your own site:"
echo "  linkchecker https://yoursite.com"
echo "  linkchecker https://yoursite.com --format html --output report.html"
echo "  linkchecker https://yoursite.com --summary --dead-only"