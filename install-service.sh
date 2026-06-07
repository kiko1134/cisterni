#!/bin/bash
# Registers the Cisterni app as a systemd service (Linux) so it starts on boot
# and restarts automatically if it crashes. Run from the project folder:
#   ./install-service.sh
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
NODE="$(command -v node)"
RUN_USER="$(whoami)"
UNIT="/etc/systemd/system/cisterni.service"

if [ -z "$NODE" ]; then
  echo "Node.js not found in PATH. Install Node LTS, run setup, then this script."
  exit 1
fi
if [ ! -f "$ROOT/frontend/dist/index.html" ]; then
  echo "frontend/dist not found. Run 'npm run setup' first."
  exit 1
fi
if [ ! -f "$BACKEND/.env" ]; then
  echo "backend/.env not found. Run 'npm run setup' first."
  exit 1
fi

echo "Creating systemd service (needs sudo)..."
sudo tee "$UNIT" >/dev/null <<EOF
[Unit]
Description=Cisterni tank monitoring
After=network.target postgresql.service

[Service]
Type=simple
WorkingDirectory=$BACKEND
ExecStart=$NODE src/app.js
Restart=always
RestartSec=5
User=$RUN_USER
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cisterni
sudo systemctl restart cisterni

echo ""
echo "Service 'cisterni' installed and started."
echo "It will now start on every boot and restart if it crashes."
echo "Open: http://localhost:4000"
echo "Check status: sudo systemctl status cisterni"
