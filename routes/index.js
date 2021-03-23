const express = require('express');
const consignee = require('./consignee');
const router = express.Router();

router.use('/consignee/',consignee);

module.exports = router;