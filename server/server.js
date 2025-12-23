const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./config/db');
const routes = require('./routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically with proper headers for video streaming
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper headers for video files to enable streaming
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'video/ogg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Routes

app.use('/api', routes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/header-poster', require('./routes/headerPoster'));
app.use('/api/header-poster', require('./routes/headerPosterVideo'));
app.use('/api/latest-posts', require('./routes/latestPosts'));
app.use('/api/home-hero', require('./routes/heroImages'));

// Start server
const PORT = process.env.PORT || 5000;

// Function to start server with retry logic
const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use.`);
            console.log('\nPlease do one of the following:');
            console.log('1. Stop the other process:');
            console.log(`   netstat -ano | findstr :${PORT}`);
            console.log('   taskkill /PID <PID> /F');
            console.log('\n2. Or change the PORT in your .env file');
            console.log('\n3. Or wait a few seconds for the port to be released\n');
            
            // Don't exit - let nodemon handle restarts
            // The error will be caught and nodemon will wait for file changes
            return;
        } else {
            console.error('Server error:', err);
            throw err;
        }
    });
    
    return server;
};

// Start the server
startServer();

