const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, ctrl.getReports);
router.get('/:internId', protect, ctrl.getReportDetail);
router.put('/:internId/final-comment', protect, ctrl.saveFinalComment);

module.exports = router;
