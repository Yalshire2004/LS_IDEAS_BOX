#!/bin/bash

# Anonymous Ideas Box - Start Script

echo "🚀 Starting Anonymous Ideas Box..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌟 Starting server on http://localhost:3000"
npm start

