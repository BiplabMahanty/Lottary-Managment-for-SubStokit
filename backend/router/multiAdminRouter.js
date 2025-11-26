const express = require("express");
const router = express.Router();

const updateAmount = require("../multiAdminController/updateAmount");





router.post("/updateRates", updateAmount);

module.exports = router;
