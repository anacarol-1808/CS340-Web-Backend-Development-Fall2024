const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Week 03 - Build Inventory Item Detail View
 * ************************** */
invCont.buildInvDetail = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInvDetail(inv_id)
  const detail = await utilities.buildInvDetailView(data)
  let nav = await utilities.getNav()
  const make = data?.inv_make
  const model = data?.inv_model
  res.render("./inventory/classification", {
    title: make + " " + model,
    nav,
    detail,
  })
}

module.exports = invCont