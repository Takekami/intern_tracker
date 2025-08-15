
const express = require('express');
const { getFeedbacks, addFeedback, updateFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, requireRole('mentor'), getFeedbacks)
  .post(protect, requireRole('mentor'), addFeedback);

router.route('/:id')
  .put(protect, requireRole('mentor'), updateFeedback)
  .delete(protect, requireRole('mentor'), deleteFeedback);

module.exports = router;
