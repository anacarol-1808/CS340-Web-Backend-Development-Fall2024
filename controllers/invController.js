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
  res.render("./inventory/detail", {
    title: make + " " + model,
    nav,
    detail,
  })
}

/* ***************************
 *  Week 04 - Render the management view
 * ************************** */
invCont.renderManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Week 04 - Render the addClassification view
 * ************************** */
invCont.renderAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Week 04 - Handle the form submission for Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav() 
  const { classification_name} = req.body

  try{
      // Check if the classification already exists
      const classificationExists = await invModel.checkExistingClassification(classification_name)

      if (classificationExists) {
      req.flash("error", "Classification name already exists. Please choose a different name.")
      res.render("/inv/add-classification", {
        title: "Add New Classification",
        classification_name,
        nav,
        errors: [{ msg: 'Classification name already exists.' }]
        })
      }

      // Insert the new classification into the database
      const result = await invModel.insertNewClassification({ classification_name })

      // Handle success response
      req.flash('success', 'Classification added successfully!')
      res.redirect('/inv/add-classification');
  } catch (error) {
      console.error("Error processing new classification:", error);  // Log the exact error
      req.flash("error", "There was an error processing your request.");
      res.redirect('/inv/add-classification');
  }
  
}


module.exports = invCont