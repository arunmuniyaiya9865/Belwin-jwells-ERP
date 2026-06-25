const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const {
  getNextDenominationId,
  createDenomination,
  getDenominations,
  getDenominationById,
  updateDenomination
} = require('../controllers/denominationController');

router.get('/next-id', getNextDenominationId);
router.post('/', createDenomination);
router.get('/', getDenominations);
router.get('/:denominationId', getDenominationById);
router.put('/:denominationId', updateDenomination);
=======
const denominationController = require('../controllers/denominationController');

// Add a new denomination
router.post('/', denominationController.addDenomination);

// Get all denominations
router.get('/', denominationController.getDenominations);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

module.exports = router;
