// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const baseController = require("../controllers/baseController");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Week 03 - Route to build a specific inventory item detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildInvDetail));

// Week 03 - Route to trigger the error
router.get("/error-trigger", utilities.handleErrors(baseController.buildIntentionalError));



module.exports = router;