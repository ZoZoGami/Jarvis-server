const express = require('express');
const router = express.Router();
const {
  createAcademicLink,
  getAllAcademicLinks,
  getAcademicLinksByCourse,
  getAcademicLinksByEmail,
  getAcademicLinkById,
  updateAcademicLink,
  deleteAcademicLink
} = require('../controllers/academicLinkController');

// Create a new academic link
router.post('/', createAcademicLink);

// Get all academic links
router.get('/', getAllAcademicLinks);

// Get academic links by course code
router.get('/course/:courseCode', getAcademicLinksByCourse);

// Get academic links by email
router.get('/user/:email', getAcademicLinksByEmail);

// Get single academic link by ID
router.get('/:id', getAcademicLinkById);

// Update an academic link
router.put('/:id', updateAcademicLink);
router.patch('/:id', updateAcademicLink);

// Delete an academic link
router.delete('/:id', deleteAcademicLink);

module.exports = router;