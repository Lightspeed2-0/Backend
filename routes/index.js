const express = require('express');
const { route } = require('./consignee');
const consignee = require('./consignee');
const transporter = require('./transporter');
const tester = require('./tester');
const admin = require('./admin');
const driver = require('./driver')
const router = express.Router();

router.use('/consignee/',consignee);
router.use('/transporter/',transporter);
router.use('/test',tester);
router.use('/admin',admin);
router.use("/driver",driver)
module.exports = router;