const express = require('express');
const router = express.Router();
const loanClosureController = require('../controllers/loanClosureController');

router.get('/:loanId', loanClosureController.getClosureDetails);
router.post('/:loanId', loanClosureController.processClosure);

module.exports = router;
