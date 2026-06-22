const express = require('express');
const router = express.Router();
const {
    createFollowup,
    getFollowups
} = require('../controllers/followupController');

router.route('/')
    .get(getFollowups)
    .post(createFollowup);

module.exports = router;
