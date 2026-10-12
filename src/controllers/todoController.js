const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get all todos
exports.getAllTodos = async (req, res) => {
  try {
    const db = getDB();
    const todos = await db.collection('todos').find().toArray();
    
    // Ensure each todo has a title field with fallback
    const todosWithTitles = todos.map(todo => ({
      ...todo,
      title: todo.title || 'Untitled Todo'
    }));
    
    res.status(200).json(todosWithTitles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get todos for a specific user by email
exports.getUserTodos = async (req, res) => {
  try {
    const db = getDB();
    const todos = await db.collection('todos').find({ email: req.params.email }).toArray();
    
    // Ensure each todo has a title field with fallback
    const todosWithTitles = todos.map(todo => ({
      ...todo,
      title: todo.title || 'Untitled Todo'
    }));
    
    res.status(200).json(todosWithTitles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single todo by ID
exports.getTodo = async (req, res) => {
  try {
    const db = getDB();
    const todo = await db.collection('todos').findOne({ _id: new ObjectId(req.params.id) });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    
    // Ensure todo has a title field with fallback
    const todoWithTitle = {
      ...todo,
      title: todo.title || 'Untitled Todo'
    };
    
    res.status(200).json(todoWithTitle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new todo with title
exports.createTodo = async (req, res) => {
  try {
    const db = getDB();
    const { email, title, todo, priority } = req.body;
    
    if (!email || !todo) {
      return res.status(400).json({ error: 'Email and todo description are required' });
    }

    const newTodo = { 
      email,
      title: title || 'Untitled Todo', // Add title field with fallback
      todo, 
      priority: priority || 'medium',
      createdAt: new Date(),
      completed: false,
      updatedAt: new Date()
    };
    
    const result = await db.collection('todos').insertOne(newTodo);
    res.status(201).json({ _id: result.insertedId, ...newTodo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update todo with title support
exports.updateTodo = async (req, res) => {
  try {
    const db = getDB();
    const { title, todo, priority, completed } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    // Add all fields that might be updated
    if (title !== undefined) updateData.title = title;
    if (todo !== undefined) updateData.todo = todo;
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;
    
    const result = await db.collection('todos').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json(updateData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('todos').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json({ 
      _id: req.params.id,
      deleted: true,
      message: 'Todo deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};