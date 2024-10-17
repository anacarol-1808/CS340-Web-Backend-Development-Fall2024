// This file will hold functions that are "utility" in nature, meaning that we will reuse them over and over, but they don't directly belong to the M-V-C structure.
const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountModel = require('../models/account-model')

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Week 03 - Constructs the inventory detail view HTML
* ************************************ */
Util.buildInvDetailView = async function (vehicle) {
  let grid
  if(vehicle){
    grid = '<div id="vehicle-details-display">'
    let leftDiv = '<div id="vehicle-image">'
    leftDiv += '<img src="' + vehicle.inv_image 
    +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
    +' on CSE Motors" />' + '</div>'
    grid += leftDiv
    let rightDiv = '<div id="vehicle-details">'
    rightDiv += '<span class="bold">' + vehicle.inv_make + ' '
    rightDiv += vehicle.inv_model + ' Details' + '</span>'
    let price = parseInt(vehicle.inv_price, 10)
    rightDiv += '<p>' + '<span class="bold">Price: </span>' 
    rightDiv += price.toLocaleString("en-US", {style:"currency", currency:"USD", minimumFractionDigits: 0}) 
    rightDiv += '</p>'
    rightDiv += '<p>' + '<span class="bold">Description: </span>' + vehicle.inv_description
    rightDiv += '</p>'
    rightDiv += '<p>' + '<span class="bold">Color: </span>' + vehicle.inv_color
    rightDiv += '</p>'
    rightDiv += '<p>' +  '<span class="bold">Miles: </span>' + parseInt(vehicle.inv_miles, 10).toLocaleString('en-US')
    rightDiv += '</p>'
    rightDiv += '</div>'
    grid += rightDiv
    grid += '</div>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Week 03 - Constructs the intentional error view
* ************************************ */
Util.buildIntentionalErrorView = async function () {
  
}

/* *****************************************************
* Week 04 - Build the classification options in a drop-down select
* ***************************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* week 05 - Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
*  week 05 - Check Login
* ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* **************************************************************************************
 *  Middleware function that checks the user's account type using the JWT token (week 11)
 * *************************************************************************************** */
Util.checkAdminOrEmployee = async (req, res, next) => {
  try {
    // Check if there is a token
    const token = req.cookies.jwt;
    if (!token) {
      req.flash("notice", "You must log in to view this page.")
      return res.redirect('/account/login')
    }
    console.log("Token found:", token);

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decoded);
    
    // Get user data
    const user = await accountModel.getAccountById(decoded.account_id);
    console.log("User data:", user);

    // Specifically log the account_type
    if (user) {
      console.log("Account type:", user.account_type);
    } else {
      console.log("No user data found for account_id:", decoded.account_id);
    }
    
   // Check account type and proceed
    if (user && (user.account_type === 'Employee' || user.account_type === 'Admin')) {
      next();
    } else {
      req.flash("notice", "You do not have the necessary permissions to view this page.");
      return res.redirect('/account/login');
    }
  } catch (error) {
    console.error("Error in middleware:", error);
    req.flash("notice", "There was an error when trying to process the login request, please try again.")
    return res.redirect('/account/login');
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util