#!/bin/sh
# Start the Express API server in background
node /app/server.js &

# Start Nginx in foreground
nginx -g 'daemon off;'
