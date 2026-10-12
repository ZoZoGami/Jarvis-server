const express = require('express');
const router = express.Router();
const {
  createOrUpdateRoutine,
  getRoutineByEmail,
  deleteRoutine
} = require('../controllers/routineController');

// Create or update routine
router.post('/', createOrUpdateRoutine);

// Get routine by email
router.get('/user/:email', getRoutineByEmail);

// Delete routine
router.delete('/:email', deleteRoutine);

module.exports = router;