
const express = require('express');
const { getTasks, addTask, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, addTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);
router.patch('/:id/status', protect, updateTaskStatus)

module.exports = router;
