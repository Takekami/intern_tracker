const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, requireRole('mentor'), ctrl.getReports);
router.get('/:internId', protect, requireRole('mentor'), ctrl.getReportDetail);
router.put('/:internId/final-comment', protect, requireRole('mentor'), ctrl.saveFinalComment);

module.exports = router;
