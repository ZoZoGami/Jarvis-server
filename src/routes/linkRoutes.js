const express = require('express');
const router = express.Router();
const {
  getAllLinks,
  getUserLinks,
  createLink,
  deleteLink
} = require('../controllers/linkController');

router.route('/')
  .get(getAllLinks)
  .post(createLink);

router.get('/user/:email', getUserLinks);
router.delete('/:id', deleteLink);

module.exports = router;