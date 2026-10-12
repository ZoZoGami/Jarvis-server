const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all links
exports.getAllLinks = async (req, res) => {
  try {
    const db = getDB();
    const links = await db.collection('links').find().toArray();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get links for a specific user by email
exports.getUserLinks = async (req, res) => {
  try {
    const db = getDB();
    const links = await db.collection('links').find({ email: req.params.email }).toArray();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new link
exports.createLink = async (req, res) => {
  try {
    const db = getDB();
    const { email, courseCode, link } = req.body;
    
    if (!email || !courseCode || !link) {
      return res.status(400).json({ error: 'Email, course code and link are required' });
    }

    const newLink = { 
      email,
      courseCode,
      link,
      createdAt: new Date()
    };
    
    const result = await db.collection('links').insertOne(newLink);
    res.status(201).json({ _id: result.insertedId, ...newLink });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete link
exports.deleteLink = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('links').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.status(200).json({
      _id: req.params.id,
      deleted: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};