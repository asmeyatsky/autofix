#!/bin/bash

# LinkChecker Demo Script
# This script demonstrates LinkChecker CLI tool

echo "🔗 LinkChecker Demo - Dead Link Finder"
echo "==================================="
echo ""

# Create demo HTML site with intentional dead links
echo "📦 Creating demo site with intentional broken links..."

mkdir -p demo-site
cd demo-site

# Create index.html with various link types
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkChecker Demo Site</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .nav { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .nav a { margin-right: 15px; text-decoration: none; color: #007bff; }
        .nav a:hover { text-decoration: underline; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .dead-link { color: #dc3545; }
        .valid-link { color: #28a745; }
        .redirect-link { color: #ffc107; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <header>
        <h1>🔗 LinkChecker Demo Site</h1>
        <p>This site contains intentional dead links for testing LinkChecker.</p>
    </header>

    <nav class="nav">
        <a href="/about.html">About Page (valid)</a>
        <a href="/blog.html">Blog (valid)</a>
        <a href="/contact.html">Contact (valid)</a>
        <a href="/products.html">Products (valid)</a>
        <a href="/services.html">Services (valid)</a>
        <a href="/broken-link.html">Broken Link (404)</a>
        <a href="/missing-page.html">Missing Page (404)</a>
        <a href="https://httpstat.us/404">External 404</a>
        <a href="https://httpstat.us/500">External 500</a>
    </nav>

    <main>
        <section>
            <h2>Valid Links Section</h2>
            <p>These links should work properly:</p>
            <ul>
                <li><a href="/about.html">✅ About Us</a></li>
                <li><a href="/blog.html">✅ Blog</a></li>
                <li><a href="/contact.html">✅ Contact</a></li>
                <li><a href="/products.html">✅ Products</a></li>
            </ul>
        </section>

        <section>
            <h2>Broken Links Section</h2>
            <p>These links are intentionally broken:</p>
            <ul>
                <li><a href="/this-does-not-exist.html" class="dead-link">❌ Non-existent Page</a></li>
                <li><a href="/another-broken-page.html" class="dead-link">❌ Another Broken Page</a></li>
                <li><a href="/api/missing-endpoint" class="dead-link">❌ Missing API Endpoint</a></li>
                <li><a href="https://httpstat.us/404" class="dead-link">❌ External 404</a></li>
            </ul>
        </section>

        <section>
            <h2>Mixed Links Section</h2>
            <p>Valid and broken links mixed:</p>
            <ul>
                <li><a href="/valid-page.html">✅ Valid Page</a></li>
                <li><a href="/broken-intermediate.html">❌ Broken Intermediate</a></li>
                <li><a href="/another-valid.html">✅ Another Valid</a></li>
                <li><a href="/final-broken.html">❌ Final Broken</a></li>
            </ul>
        </section>

        <section>
            <h2>External Links</h2>
            <p>External links with various statuses:</p>
            <ul>
                <li><a href="https://google.com">✅ Google (valid)</a></li>
                <li><a href="https://httpstat.us/200">✅ External 200</a></li>
                <li><a href="https://httpstat.us/301">🔄 External 301</a></li>
                <li><a href="https://httpstat.us/404">❌ External 404</a></li>
                <li><a href="https://httpstat.us/500">❌ External 500</a></li>
                <li><a href="https://httpstat.us/timeout">❌ External Timeout</a></li>
            </ul>
        </section>

        <section>
            <h2>Deep Links</h2>
            <p>Links that should go deeper into the site:</p>
            <ul>
                <li><a href="/category/nested/page.html">Deep Nested Page</a></li>
                <li><a href="/category/subcategory/item.html">Subcategory Item</a></li>
                <li><a href="/category/another/deep/nested/page.html">Very Deep Page</a></li>
            </ul>
        </section>

        <div class="error">
            <h2>⚠️ Error Simulation</h2>
            <p>This simulates various error conditions for testing:</p>
            <ul>
                <li><a href="/javascript:void(0)">JavaScript: Void</a></li>
                <li><a href="mailto:invalid-email">Invalid Email</a></li>
                <li><a href="tel:invalid-phone">Invalid Phone</a></li>
                <li><a href="ftp://invalid-protocol">Invalid Protocol</a></li>
            </ul>
        </div>
    </main>

    <footer>
        <p><a href="/privacy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a></p>
    </footer>
</body>
</html>
EOF

# Create some valid pages to crawl
cat > about.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body>
    <h1>About Us</h1>
    <p><a href="/">Home</a></p>
    <p><a href="/blog.html">Blog</a></p>
    <p><a href="/team.html">Our Team</a></p>
    <p><a href="/broken-link.html">This will be a 404</a></p>
</body>
</html>
EOF

cat > blog.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Blog</title></head>
<body>
    <h1>Blog</h1>
    <p><a href="/">Home</a></p>
    <p><a href="/blog/post-1.html">Post 1</a></p>
    <p><a href="/blog/post-2.html">Post 2</a></p>
    <p><a href="/invalid-post.html">Invalid Post</a></p>
</body>
</html>
EOF

cat > contact.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Contact</title></head>
<body>
    <h1>Contact</h1>
    <p><a href="/">Home</a></p>
    <p><a href="/about.html">About</a></p>
    <p><a href="/support.html">Support</a></p>
</body>
</html>
EOF

cd ..

echo "✅ Demo site created in ./demo-site/"
echo ""

# Start a simple HTTP server
echo "🚀 Starting demo HTTP server on port 8080..."
cd demo-site
python3 -m http.server 8080 > /dev/null 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to start
echo "⏳ Waiting for server to start..."
for i in {1..10}; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ Demo server started on http://localhost:8080"
        break
    fi
    sleep 1
    echo "   Waiting... ($i/10)"
done

echo ""
echo "🔗 Running LinkChecker on demo site..."
echo "============================================"
echo ""

# Check if LinkChecker is installed
if ! command -v linkchecker &> /dev/null; then
    echo "❌ LinkChecker is not installed or not in PATH"
    echo ""
    echo "Please install LinkChecker first:"
    echo "  cd /path/to/autofix/linkchecker"
    echo "  npm install"
    echo "  npm run build"
    echo "  npm install -g ."
    echo ""
    # Clean up
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Run LinkChecker with various options
echo "1️⃣ Basic check (summary only):"
echo "   linkchecker http://localhost:8080 --summary"
echo ""
linkchecker http://localhost:8080 --summary

echo ""
echo "2️⃣ Show only dead links:"
echo "   linkchecker http://localhost:8080 --dead-only"
echo ""
linkchecker http://localhost:8080 --dead-only

echo ""
echo "3️⃣ Full check with JSON output:"
echo "   linkchecker http://localhost:8080 --format json --output linkcheck-results.json"
echo ""
linkchecker http://localhost:8080 --format json --output linkcheck-results.json

echo ""
echo "4️⃣ HTML report:"
echo "   linkchecker http://localhost:8080 --format html --output linkcheck-report.html --no-color"
echo ""
linkchecker http://localhost:8080 --format html --output linkcheck-report.html --no-color

echo ""
echo "5️⃣ Advanced check with filtering:"
echo "   linkchecker http://localhost:8080 --max-depth 2 --exclude \"\\.(jpg|png|pdf)$\" --summary"
echo ""
linkchecker http://localhost:8080 --max-depth 2 --exclude "\.(jpg|png|pdf)$" --summary

# Clean up
echo ""
echo "🧹 Cleaning up demo server..."
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "📊 Demo Results Summary:"
echo "==================="
echo "✅ Created demo site with intentional dead links"
echo "✅ Started HTTP server on port 8080"
echo "✅ Ran LinkChecker with various configurations"
echo "✅ Generated multiple output formats (JSON, HTML)"
echo ""
echo "📁 Generated files:"
echo "   - linkcheck-results.json (JSON report)"
echo "   - linkcheck-report.html (HTML report)"
echo ""
echo "💡 To use LinkChecker on your own site:"
echo "   linkchecker https://yoursite.com"
echo "   linkchecker https://yoursite.com --format html --output report.html"
echo "   linkchecker https://yoursite.com --summary --dead-only"
echo ""
echo "🔗 For more options: linkchecker --help"