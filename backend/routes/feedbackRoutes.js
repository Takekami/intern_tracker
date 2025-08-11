
const express = require('express');
const { getFeedbacks, addFeedback, updateFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getFeedbacks).post(protect, addFeedback);
router.route('/:id').put(protect, updateFeedback).delete(protect, deleteFeedback);

module.exports = router;
