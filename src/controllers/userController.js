const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Create new user
exports.createUser = async (req, res) => {
  try {
    const db = getDB();
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser = { 
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    res.status(201).json({ 
      _id: result.insertedId, 
      ...newUser,
      message: 'User created successfully' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const db = getDB();
    const { name, email } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ 
      _id: req.params.id, 
      ...updateData,
      message: 'User updated successfully' 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ 
      _id: req.params.id, 
      deleted: true,
      message: 'User deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};