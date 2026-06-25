const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const Followup = require('../models/Followup');

router.post('/', async (req, res) => {
  try {
    const followup = new Followup(req.body);
    await followup.save();
    res.status(201).json({ success: true, data: followup });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const followups = await Followup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: followups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
=======
const {
    createFollowup,
    getFollowups
} = require('../controllers/followupController');

router.route('/')
    .get(getFollowups)
    .post(createFollowup);
>>>>>>> bc349fb706e4bcd8458de02e4c1318f493c3b4b6

module.exports = router;
