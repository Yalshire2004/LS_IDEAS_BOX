# Anonymous Ideas Box

A simple web application for submitting and viewing anonymous ideas using SQLite database.

## Features

- Anonymous idea submission
- View all submitted ideas
- Clean and modern UI
- SQLite database for data storage

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

### Quick Start (Recommended)
Run the start script:
```bash
./start.sh
```

The script will automatically install dependencies if needed and start the server.

### Manual Start
Or start the server manually:
```bash
npm install  # First time only
npm start
```

The application will be available at `http://localhost:3000`

- **Home Page**: `http://localhost:3000` - Submit ideas anonymously
- **Admin Page**: `http://localhost:3000/admin.html` - View all submitted ideas

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML, CSS, JavaScript

## Deployment to Render

This app is optimized for deployment to Render.com

### Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Deployment Steps

1. **Create a new Web Service on Render:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure the service:**
   - **Name**: anonymous-ideas-box (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose a paid plan)

3. **Set Environment Variables:**
   - Go to "Environment" tab in Render dashboard
   - Add the following environment variables:
     - `NODE_ENV` = `production`
     - `ADMIN_PASSWORD` = (your admin password - keep it secure!)
     - `SESSION_SECRET` = (a random secret string for session encryption)
   
   **Generate SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - Wait for deployment to complete (usually 2-5 minutes)

5. **Access your app:**
   - Your app will be available at: `https://your-app-name.onrender.com`
   - The admin page password will be whatever you set in `ADMIN_PASSWORD`

### Using render.yaml (Alternative Method)

If you prefer, you can use the included `render.yaml` file:

1. Push your code to Git (make sure `render.yaml` is included)
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use `render.yaml`
5. Still need to manually set `ADMIN_PASSWORD` in Environment Variables

### Important Notes for Production

- **Database Persistence**: SQLite database file (`ideas.db`) will be created in the app directory. On Render's free tier, this data is ephemeral and may be lost when the service sleeps. Consider upgrading to a paid plan or using an external database for production.

- **Password Security**: Never commit your `.env` file or hardcode passwords. Always use environment variables in production.

- **Session Security**: The app automatically uses secure cookies in production (HTTPS).

- **Service Sleep**: Free tier services on Render sleep after 15 minutes of inactivity. The first request after sleep may take ~30 seconds to respond while the service wakes up.

