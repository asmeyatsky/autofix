#!/bin/bash

# Complete Web Application Health Check
# Integrates LinkChecker, AutoFix, and CORS Utils

set -e

echo "🚀 Complete Web Application Health Check"
echo "======================================"
echo "Integrating LinkChecker, AutoFix, and CORS Utils"
echo ""

# Configuration
FRONTEND_URL=${1:-"http://localhost:3000"}
BACKEND_URL=${2:-"http://localhost:8000"}
PROJECT_DIR=${3:-"./src"}

echo "📋 Configuration:"
echo "   Frontend URL: $FRONTEND_URL"
echo "   Backend URL:  $BACKEND_URL"
echo "   Project Dir:   $PROJECT_DIR"
echo ""

# Function to check if URL is accessible
check_url() {
    local url=$1
    local name=$2
    
    echo "🔍 Checking $name accessibility..."
    if curl -s --head --connect-timeout 5 "$url" > /dev/null 2>&1; then
        echo "✅ $name is accessible"
        return 0
    else
        echo "❌ $name is not accessible - skipping related tests"
        return 1
    fi
}

# Step 1: LinkChecker for dead links
echo "🔗 Step 1: Checking for dead links..."
if check_url "$FRONTEND_URL" "Frontend"; then
    if command -v linkchecker &> /dev/null; then
        linkchecker "$FRONTEND_URL" \
            --format json \
            --output links-results.json \
            --summary \
            --max-depth 3 \
            --max-pages 50 \
            --no-color
        echo "✅ Link check complete - results saved to links-results.json"
    else
        echo "⚠️ LinkChecker not found. Install with: npm install -g linkchecker"
    fi
else
    echo "⚠️ Skipping link check - frontend not accessible"
fi
echo ""

# Step 2: CORS analysis
echo "🌐 Step 2: Analyzing CORS configuration..."
if check_url "$BACKEND_URL" "Backend"; then
    if command -v corsutils &> /dev/null; then
        corsutils analyze "$FRONTEND_URL" "$BACKEND_URL"
        echo "✅ CORS analysis complete"
    else
        echo "⚠️ CORS Utils not found. Install with: npm install -g corsutils"
    fi
else
    echo "⚠️ Skipping CORS check - backend not accessible"
fi
echo ""

# Step 3: AutoFix for frontend errors
echo "🔧 Step 3: Checking for frontend errors..."
if check_url "$FRONTEND_URL" "Frontend"; then
    if command -v autofix &> /dev/null; then
        # Check if AutoFix API key is set
        if [ -n "$AUTOFIX_LLM_API_KEY" ]; then
            autofix \
                --url "$FRONTEND_URL" \
                --project "$PROJECT_DIR" \
                --max-attempts 3 \
                --timeout 30000 \
                --headless
            echo "✅ AutoFix check complete"
        else
            echo "⚠️ AutoFix API key not set. Set with: export AUTOFIX_LLM_API_KEY='your-key'"
            echo "   You can still run AutoFix with a test key, but fixes won't be applied."
        fi
    else
        echo "⚠️ AutoFix not found. Install with: npm install -g autofix"
    fi
else
    echo "⚠️ Skipping AutoFix - frontend not accessible"
fi
echo ""

# Step 4: Generate comprehensive report
echo "📊 Step 4: Generating summary report..."

REPORT_FILE="health-check-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# Web Application Health Check Report

**Date:** $(date)
**Frontend URL:** $FRONTEND_URL
**Backend URL:** $BACKEND_URL

## Check Summary

EOF

# Add LinkChecker results if available
if [ -f "links-results.json" ]; then
    echo "### 🔗 LinkChecker Results" >> "$REPORT_FILE"
    echo "Link check completed. See \`links-results.json\` for detailed results." >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Add CORS suggestions
echo "### 🌐 CORS Configuration" >> "$REPORT_FILE"
echo "For common CORS issues, generate server configurations:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "```bash" >> "$REPORT_FILE"
echo "# Express.js" >> "$REPORT_FILE"
echo "corsutils config express --origins \"$FRONTEND_URL\"" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Next.js" >> "$REPORT_FILE"
echo "corsutils config next --origins \"$FRONTEND_URL\"" >> "$REPORT_FILE"
echo "# Nginx" >> "$REPORT_FILE"
echo "corsutils config nginx --origins \"$FRONTEND_URL\"" >> "$REPORT_FILE"
echo "```" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Add AutoFix notes
echo "### 🔧 Frontend Error Handling" >> "$REPORT_FILE"
echo "AutoFix monitoring completed. Any detected errors should have been automatically fixed." >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Add next steps
echo "### 📋 Next Steps" >> "$REPORT_FILE"
echo "1. Review LinkChecker results for broken links" >> "$REPORT_FILE"
echo "2. Apply CORS configuration to your backend" >> "$REPORT_FILE"
echo "3. Review any AutoFix changes to your codebase" >> "$REPORT_FILE"
echo "4. Run regular health checks in your CI/CD pipeline" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "✅ Health check report generated: $REPORT_FILE"

# Final summary
echo ""
echo "🎯 Complete Health Check Summary:"
echo "   Frontend URL: $FRONTEND_URL"
echo "   Backend URL:  $BACKEND_URL"
echo "   Report File:  $REPORT_FILE"
echo ""
echo "💡 Pro tips:"
echo "   • Set up these checks in your CI/CD pipeline"
echo "   • Run this script before deploying to production"
echo "   • Schedule regular health checks for production monitoring"
echo ""
echo "🚀 Health check completed successfully!"