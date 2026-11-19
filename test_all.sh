#!/usr/bin/env bash
set -e

echo "=================================================="
echo "🧪 [1/2] RUNNING SOLIDITY SECURITY SMART CONTRACT TESTS"
echo "=================================================="
cd blockchain
HOME=/tmp XDG_DATA_HOME=/tmp/.local/share XDG_CONFIG_HOME=/tmp/.config XDG_CACHE_HOME=/tmp/.cache CI=true npx hardhat test
cd ..

echo ""
echo "=================================================="
echo "🧪 [2/2] RUNNING DJANGO BACKEND & AI GENERATOR TESTS"
echo "=================================================="
cd backend
source venv/bin/activate
python manage.py test
cd ..

echo ""
echo "=================================================="
echo "✨ ALL RECRFT CLONE TESTS PASSED WITH 100% SUCCESS!"
echo "=================================================="
