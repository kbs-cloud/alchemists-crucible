#!/bin/bash
# Exit on error
set -e

DEPLOY_DIR="/servers/alchemists-crucible"
REPO_DIR="/home/gemini/repos/kbs-cloud/alchemists-crucible"

# Find Node.js path (default to NVM directory if not in current PATH)
NODE_EXEC=$(which node || echo "/home/gemini/.nvm/versions/node/v24.16.0/bin/node")
NODE_BIN=$(dirname "$NODE_EXEC")

echo "=== Starting Alchemist's Crucible Deployment ==="
echo "Node binary directory: $NODE_BIN"

# Ensure NVM node directory is at the front of PATH so npm works correctly
export PATH="$NODE_BIN:$PATH"

# Build the project
echo "Building project in $REPO_DIR..."
cd "$REPO_DIR"
npm run build

# Prepare deploy folder
echo "Preparing deploy folder at $DEPLOY_DIR..."
if [ ! -d "$DEPLOY_DIR" ]; then
    sudo mkdir -p "$DEPLOY_DIR"
    sudo chown -R gemini:gemini "$DEPLOY_DIR"
fi

# Copy built files and package files
echo "Copying files to $DEPLOY_DIR..."
mkdir -p "$DEPLOY_DIR/src/game/dist"
mkdir -p "$DEPLOY_DIR/dist"

cp -R dist/* "$DEPLOY_DIR/dist/"
cp -R src/game/dist/* "$DEPLOY_DIR/src/game/dist/"
cp server.cjs "$DEPLOY_DIR/"
cp package.json package-lock.json "$DEPLOY_DIR/"
cp register_game.cjs "$DEPLOY_DIR/"

# Preserve SQLite database if it exists in repo but not in deploy dir
if [ -f "$REPO_DIR/alchemists_crucible.db" ] && [ ! -f "$DEPLOY_DIR/alchemists_crucible.db" ]; then
    echo "Copying existing database to $DEPLOY_DIR..."
    cp "$REPO_DIR/alchemists_crucible.db" "$DEPLOY_DIR/alchemists_crucible.db"
fi

# Install production dependencies
echo "Installing production node modules in $DEPLOY_DIR..."
cd "$DEPLOY_DIR"
npm ci --omit=dev

# Write systemd service file
echo "Configuring systemd service..."
SERVICE_FILE="/etc/systemd/system/alchemists-crucible.service"

sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Alchemist's Crucible Game Service
After=network.target

[Service]
Type=simple
User=gemini
WorkingDirectory=$DEPLOY_DIR
ExecStart=$NODE_BIN/node server.cjs
Restart=always
Environment=NODE_ENV=production BACKEND_PORT=20004 FRONTEND_PORT=19004 DATABASE_PATH=$DEPLOY_DIR/alchemists_crucible.db AUTH_SERVER_URL=http://localhost:20001 HUB_API_URL=http://localhost:20000 HUB_APP_TOKEN=alchemist_token_dev_777
Environment="PATH=$NODE_BIN:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF

# Reload and restart service
echo "Reloading systemd and restarting alchemists-crucible service..."
sudo systemctl daemon-reload
sudo systemctl enable alchemists-crucible
sudo systemctl restart alchemists-crucible

# Run the database registration utility
echo "Registering application and achievements in the Hub catalog..."
node register_game.cjs

echo "=== Deployment Finished Successfully ==="
