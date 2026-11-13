const express = require('express');
const router = express.Router();
const { getSummaryReport, exportReportCSV } = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('teacher', 'admin'));

router.get('/summary', getSummaryReport);
router.get('/export-csv', exportReportCSV);

module.exports = router;
