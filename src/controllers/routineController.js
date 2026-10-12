const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Create or update routine
exports.createOrUpdateRoutine = async (req, res) => {
  try {
    const db = getDB();
    const { email, routine } = req.body;
    
    if (!email || !routine) {
      return res.status(400).json({ error: 'Email and routine are required' });
    }

    // Validate routine structure
    if (!Array.isArray(routine)) {
      return res.status(400).json({ error: 'Routine must be an array' });
    }

    // Check if routine already exists for this user
    const existingRoutine = await db.collection('routines').findOne({ email });
    
    if (existingRoutine) {
      // Update existing routine
      const result = await db.collection('routines').updateOne(
        { email },
        { $set: { routine, updatedAt: new Date() } }
      );
      res.status(200).json({ 
        message: 'Routine updated successfully',
        routine: routine 
      });
    } else {
      // Create new routine
      const newRoutine = {
        email,
        routine,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('routines').insertOne(newRoutine);
      res.status(201).json({ 
        message: 'Routine created successfully',
        routine: routine 
      });
    }
  } catch (err) {
    console.error('Error saving routine:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get routine by email
exports.getRoutineByEmail = async (req, res) => {
  try {
    const db = getDB();
    const routine = await db.collection('routines').findOne({ email: req.params.email });
    
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }
    
    res.status(200).json(routine);
  } catch (err) {
    console.error('Error fetching routine:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete routine
exports.deleteRoutine = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('routines').deleteOne({ email: req.params.email });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Routine not found' });
    }
    
    res.status(200).json({ message: 'Routine deleted successfully' });
  } catch (err) {
    console.error('Error deleting routine:', err);
    res.status(500).json({ error: err.message });
  }
};