const express = require('express');
const router = express.Router();
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

module.exports = router;
