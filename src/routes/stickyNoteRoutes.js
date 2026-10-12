const express = require('express');
const router = express.Router();
const stickyNoteController = require('../Controllers/stickyNoteController');

router.post('/add', stickyNoteController.createStickyNote);

module.exports = router;
