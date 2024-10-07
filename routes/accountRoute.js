// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

// Week 04 - "GET" route for the path that will be sent when the "My Account" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

module.exports = router;