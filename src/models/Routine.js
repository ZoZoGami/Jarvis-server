const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  courseTitle: { type: String, required: true },
  room: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
});

module.exports = mongoose.model('Routine', routineSchema);
