
const express = require('express');
const { getTasks, addTask, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, requireRole('mentor', 'intern'), getTasks)
  .post(protect, requireRole('mentor'), addTask);

router.route('/:id')
  .put(protect, requireRole('mentor'), updateTask)
  .delete(protect, requireRole('mentor'), deleteTask);

router.patch('/:id/status', protect, requireRole('intern', 'mentor'), updateTaskStatus);

module.exports = router;
