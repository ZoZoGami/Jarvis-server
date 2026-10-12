/**
 * Jarvis Server - Configuration Module
 *
 * MongoDB Atlas connection management with connection pooling
 * and singleton pattern for efficient database access.
 *
 * Author: Fayez Ahmad Protik
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

let db = null;
const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/jarvis');

/**
 * Establish connection to MongoDB Atlas
 * Uses connection pooling and auto-reconnection
 */
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('MONGODB_URI not set, using local default');
        }

        await client.connect();
        db = client.db(process.env.DB_NAME || 'jarvis');

        console.log('✅ MongoDB Connected successfully');
        console.log(`   Database: ${db.databaseName}`);

        // Handle connection events
        client.on('close', () => {
            console.log('MongoDB connection closed');
        });

    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

/**
 * Get the database instance
 * @returns {Db} MongoDB database instance
 * @throws {Error} If database not connected
 */
const getDB = () => {
    if (!db) {
        throw new Error('Database not connected! Call connectDB() first.');
    }
    return db;
};

/**
 * Close MongoDB connection gracefully
 */
const closeDB = async () => {
    try {
        await client.close();
        db = null;
        console.log('MongoDB connection closed gracefully');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    }
};

module.exports = { connectDB, getDB, closeDB, client };