/**
 * Express Application Setup
 *
 * Configures middleware, routes, and error handling
 *
 * Author: Fayez Ahmad Protik
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { initializeScheduledJobs } = require('./scheduled/reminderJobs');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to Database
connectDB();

// Initialize Scheduled Jobs (Cron)
if (process.env.NODE_ENV !== 'test') {
    initializeScheduledJobs();
}

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'JARVIS API'
    });
});

// API Routes
app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/todos', require('../routes/todoRoutes'));
app.use('/api/links', require('../routes/linkRoutes'));
app.use('/api/academic-links', require('../routes/academicLinkRoutes'));
app.use('/api/routines', require('../routes/routineRoutes'));
app.use('/api/reminders', require('../routes/reminderRoutes'));
app.use('/api/sticky-notes', require('../routes/stickyNoteRoutes'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;