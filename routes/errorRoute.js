// Needed Resources 
const express = require("express")
const router = new express.Router() 
const errorController = require("../controllers/errorController")
const utilities = require("../utilities")

// Week 03 - Route to build inventory detail Error
//router.get("/error/", utilities.handleErrors(errorController.buildIntentionalError))