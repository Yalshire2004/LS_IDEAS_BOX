require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const db = require('./database');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Trust proxy for Render/Heroku
if (isProduction) {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'lovestream-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // Use secure cookies in production (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'none' : 'lax' // Required for cross-origin in production
  }
}));
app.use(express.static('public'));

// Middleware to check admin authentication
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

// API Routes

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin authentication
app.post('/api/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (password === ADMIN_PASSWORD) {
      req.session.authenticated = true;
      res.json({ success: true, message: 'Authentication successful' });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: req.session && req.session.authenticated || false });
});

// Submit an idea
app.post('/api/ideas', (req, res) => {
  try {
    const { idea } = req.body;
    
    if (!idea || idea.trim() === '') {
      return res.status(400).json({ error: 'Idea cannot be empty' });
    }

    const stmt = db.prepare('INSERT INTO ideas (idea, status) VALUES (?, ?)');
    const result = stmt.run(idea.trim(), 'Not Implemented');
    
    res.json({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'Idea submitted successfully!' 
    });
  } catch (error) {
    console.error('Error submitting idea:', error);
    res.status(500).json({ error: 'Failed to submit idea' });
  }
});

// Get all ideas (protected)
app.get('/api/ideas', requireAuth, (req, res) => {
  try {
    const ideas = db.prepare('SELECT * FROM ideas ORDER BY timestamp DESC').all();
    res.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Update idea status (protected)
app.put('/api/ideas/:id/status', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Not Implemented', 'Implemented', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const stmt = db.prepare('UPDATE ideas SET status = ? WHERE id = ?');
    const result = stmt.run(status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete an idea (protected)
app.delete('/api/ideas/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    
    const stmt = db.prepare('DELETE FROM ideas WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    res.json({ success: true, message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

// Export ideas to Excel (protected)
app.get('/api/ideas/export', requireAuth, (req, res) => {
  try {
    const ideas = db.prepare('SELECT id, idea, status, timestamp FROM ideas ORDER BY timestamp DESC').all();
    
    // Prepare data for Excel
    const excelData = ideas.map(idea => ({
      'ID': idea.id,
      'Idea': idea.idea,
      'Status': idea.status,
      'Submitted Date': new Date(idea.timestamp).toLocaleString('en-US')
    }));
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ideas');
    
    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    const filename = `ideas_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting ideas:', error);
    res.status(500).json({ error: 'Failed to export ideas' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  if (isProduction) {
    console.log('Production mode: Secure cookies enabled');
  }
});

