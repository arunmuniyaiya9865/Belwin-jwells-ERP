const express = require('express');
const router = express.Router();
const GoldRequest = require('../models/GoldRequest');

router.post('/', async (req, res) => {
  try {
    const request = new GoldRequest(req.body);
    await request.save();
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const requests = await GoldRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
