const StickyNote = require('../Models/StickyNote');

exports.createStickyNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const stickyNote = new StickyNote({ title, content });
    await stickyNote.save();
    res.status(201).json({ message: 'Sticky note added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
