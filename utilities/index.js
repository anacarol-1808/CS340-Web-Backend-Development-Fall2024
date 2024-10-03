// This file will hold functions that are "utility" in nature, meaning that we will reuse them over and over, but they don't directly belong to the M-V-C structure.
const invModel = require("../models/inventory-model")
const Util = {}

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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util