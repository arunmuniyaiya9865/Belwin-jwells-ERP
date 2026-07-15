const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Followup = require('../models/Followup');

router.post('/', protect, async (req, res) => {
  try {
    const followup = new Followup(req.body);
    await followup.save();
    res.status(201).json({ success: true, data: followup });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const followups = await Followup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: followups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
