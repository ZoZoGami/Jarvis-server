const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Create new academic link
exports.createAcademicLink = async (req, res) => {
  try {
    const db = getDB();
    const { email, courseCode, link, description } = req.body;
    
    if (!email || !courseCode || !link) {
      return res.status(400).json({ error: 'Email, course code and link are required' });
    }

    const newLink = { 
      email,
      courseCode,
      link,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('academic_links').insertOne(newLink);
    res.status(201).json({ _id: result.insertedId, ...newLink });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all academic links
exports.getAllAcademicLinks = async (req, res) => {
  try {
    const db = getDB();
    const links = await db.collection('academic_links').find().toArray();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get academic links by course code
exports.getAcademicLinksByCourse = async (req, res) => {
  try {
    const db = getDB();
    const links = await db.collection('academic_links')
                         .find({ courseCode: req.params.courseCode })
                         .toArray();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get academic links by email
exports.getAcademicLinksByEmail = async (req, res) => {
  try {
    const db = getDB();
    const links = await db.collection('academic_links')
                         .find({ email: req.params.email })
                         .toArray();
    res.status(200).json(links);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single academic link by ID
exports.getAcademicLinkById = async (req, res) => {
  try {
    const db = getDB();
    const link = await db.collection('academic_links')
                        .findOne({ _id: new ObjectId(req.params.id) });
    if (!link) {
      return res.status(404).json({ error: 'Academic link not found' });
    }
    res.status(200).json(link);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update academic link
exports.updateAcademicLink = async (req, res) => {
  try {
    const db = getDB();
    const { email, courseCode, link, description } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    if (email) updateData.email = email;
    if (courseCode) updateData.courseCode = courseCode;
    if (link) updateData.link = link;
    if (description) updateData.description = description;
    
    const result = await db.collection('academic_links').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Academic link not found' });
    }
    
    res.status(200).json({ _id: req.params.id, ...updateData });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete academic link
exports.deleteAcademicLink = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('academic_links')
                          .deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Academic link not found' });
    }
    
    res.status(200).json({ 
      _id: req.params.id, 
      deleted: true,
      message: 'Academic link deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};