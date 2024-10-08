// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

// Week 04 - "GET" route for the path that will be sent when the "My Account" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Week 04 - Route to the accountRoute file, to start the delivery of the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Week 04 - Route to Process the Registration
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router;