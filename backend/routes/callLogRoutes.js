const express = require('express');
const router = express.Router();
const callLogController = require('../controllers/callLogController');

// Define routes
router.post('/', callLogController.createCallLog);
router.get('/', callLogController.getCallLogs);
router.get('/report', callLogController.getCallLogsReport);
router.get('/:callId', callLogController.getCallLogById);
router.get('/customer/:customerId', callLogController.getCallLogsByCustomerId);

module.exports = router;
