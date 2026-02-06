#!/bin/bash

# Pre-deployment Checklist Script
# Run this before deploying to ensure everything is ready

echo "🚀 Monkey Project - Deployment Readiness Check"
echo "==============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check files
echo "📁 Checking required files..."

files=(
  ".gitignore"
  "backend/.env.example"
  "frontend/.env.example"
  "backend/package.json"
  "frontend/package.json"
  "DEPLOYMENT.md"
)

all_files_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file exists"
  else
    echo -e "${RED}✗${NC} $file missing"
    all_files_exist=false
  fi
done

echo ""

# Check .env files are gitignored
echo "🔒 Checking .env files are not tracked..."
if git ls-files | grep -q "\.env$"; then
  echo -e "${RED}✗${NC} .env files are tracked in git!"
  echo "   Run: git rm --cached backend/.env frontend/.env"
else
  echo -e "${GREEN}✓${NC} .env files are properly ignored"
fi

echo ""

# Check package.json scripts
echo "📦 Checking backend scripts..."
if grep -q '"start".*"node src/index.js"' backend/package.json; then
  echo -e "${GREEN}✓${NC} Backend start script configured"
else
  echo -e "${RED}✗${NC} Backend start script missing"
fi

echo ""

echo "📦 Checking frontend scripts..."
if grep -q '"build"' frontend/package.json; then
  echo -e "${GREEN}✓${NC} Frontend build script configured"
else
  echo -e "${RED}✗${NC} Frontend build script missing"
fi

echo ""

# Check git status
echo "🔍 Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Git repository initialized"
  
  if git remote get-url origin > /dev/null 2>&1; then
    remote_url=$(git remote get-url origin)
    echo -e "${GREEN}✓${NC} Remote configured: $remote_url"
  else
    echo -e "${YELLOW}!${NC} No remote configured"
    echo "   Run: git remote add origin https://github.com/ishaansh20/Monkey.git"
  fi
else
  echo -e "${RED}✗${NC} Not a git repository"
  echo "   Run: git init"
fi

echo ""
echo "═══════════════════════════════════════"
echo ""

# Deployment checklist
echo "📋 Pre-Deployment Checklist:"
echo ""
echo "Backend:"
echo "  □ MongoDB Atlas cluster created"
echo "  □ Database user created with password"
echo "  □ IP whitelist set to 0.0.0.0/0"
echo "  □ Connection string copied"
echo "  □ JWT_SECRET generated (32+ chars)"
echo "  □ SESSION_SECRET generated (32+ chars)"
echo ""
echo "Frontend:"
echo "  □ Backend URL ready for VITE_API_BASE_URL"
echo ""
echo "GitHub:"
echo "  □ Code pushed to GitHub"
echo "  □ Repository is public or Render has access"
echo ""
echo "Render:"
echo "  □ Render account created"
echo "  □ Ready to deploy backend first"
echo "  □ Ready to deploy frontend second"
echo ""

if [ "$all_files_exist" = true ]; then
  echo -e "${GREEN}✅ All files check passed!${NC}"
  echo -e "${GREEN}You're ready to deploy!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
  echo "2. Follow DEPLOYMENT.md guide"
else
  echo -e "${RED}❌ Some files are missing${NC}"
  echo "Please ensure all required files exist before deploying"
fi

echo ""
echo "📚 Read DEPLOYMENT.md for complete step-by-step guide"
echo ""
