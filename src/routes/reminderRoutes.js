const express = require('express');
const router = express.Router();
const {
  createReminder,
  getUserReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  testEmail
} = require('../controllers/reminderController');

// Create a new reminder
router.post('/', createReminder);

// Get all reminders for user
router.get('/user/:email', getUserReminders);

// Get single reminder by ID
router.get('/:id', getReminder);

// Update a reminder
router.put('/:id', updateReminder);
router.patch('/:id', updateReminder);

// Delete a reminder
router.delete('/:id', deleteReminder);

// Test email endpoint
router.post('/test-email', testEmail);

module.exports = router;