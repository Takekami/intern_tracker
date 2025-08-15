
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile, listInterns } = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/interns', protect, requireRole('mentor'), listInterns);

module.exports = router;
