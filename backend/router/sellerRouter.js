const express = require("express");
const router = express.Router();
const upload=require("../middlewire/uploads")

//const { addTicket } = require("../sellerController/addTicketController");
//const { addNumbers } = require("../sellerController/addNumbersController");
const addSeller = require("../adminController/addSeller");
const addNumberToSeller = require("../adminController/addNumber");
const deleteNumberToSeller = require("../adminController/addDelete");
const paymentDay = require("../adminController/payment");
const { getseller } = require("../getAdminController/getAdmin");
const { getDelete } = require("../getAdminController/getDelete");
const { getSell } = require("../getAdminController/getSell");
const { getNumber } = require("../getAdminController/getNumber");
const { getMultiAdmin } = require("../getAdminController/getMultiAdmin");
const { getsellerById } = require("../getAdminController/getSellerById");
const { getPayment } = require("../getAdminController/getPayment");





//router.post("/add", addTicket);
//router.post("/addNumber", addNumbers);

router.post("/addSeller", upload.single("image"),addSeller);
router.post("/addNumberToSeller",addNumberToSeller);
router.post("/deleteNumberToSeller",deleteNumberToSeller);

router.post("/paymentDay",paymentDay);

router.get("/getseller",getseller);

router.post("/getDelete",getDelete);

router.post("/getSell",getSell);

router.post("/getNumber",getNumber);

router.get("/getMultiAdmin",getMultiAdmin);

router.get("/getsellerById/:sellerId",getsellerById);

router.get("/getPayment",getPayment);





module.exports = router;
