const express = require('express');
const {
  getAllTodos,
  getUserTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');

const router = express.Router();

// Get all todos or create new todo
router.route('/')
  .get(getAllTodos)
  .post(createTodo);

// Get todos for specific user
router.get('/user/:email', getUserTodos);

// Get/Update/Delete specific todo
router.route('/:id')
  .get(getTodo)
  .patch(updateTodo)
  .delete(deleteTodo);

module.exports = router;