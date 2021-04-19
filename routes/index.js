const express = require('express');
const { route } = require('./consignee');
const consignee = require('./consignee');
const transporter = require('./transporter');
const tester = require('./tester');

const router = express.Router();

router.use('/consignee/',consignee);
router.use('/transporter/',transporter);
router.use('/test',tester);
module.exports = router;