const mongoose = require('mongoose');

const stickyNoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

module.exports = mongoose.model('StickyNote', stickyNoteSchema);
