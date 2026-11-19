#!/usr/bin/env bash
cd blockchain
echo "Starting Hardhat local Ethereum node on http://127.0.0.1:8545 ..."
HOME=/tmp XDG_DATA_HOME=/tmp/.local/share XDG_CONFIG_HOME=/tmp/.config XDG_CACHE_HOME=/tmp/.cache CI=true npx hardhat node
