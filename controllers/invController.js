const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getApprovedInventoryByClassificationId(classification_id)
  
  // Check if no vehicles are found
  if (data.length === 0) {
    req.flash("notice", "There are no vehicles for this classification.")
    return res.redirect("/") // Redirect to the home page
  }
  
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
 *  Week 04 - Render the inventory management view
 * ************************** */
invCont.renderManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    loggedIn: req.session.loggedIn,
    user: req.session.user,
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
    loggedIn: req.session.loggedIn,
    user: req.session.user,
    errors: null,
  })
}

/* ***************************
 *  Week 04 - Handle the form submission for Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const account_id = req.session.user.account_id; // Get account_id from session

  try {
    // Check if the classification already exists
    const classificationExists = await invModel.checkExistingClassification(classification_name);

    if (classificationExists) {
      req.flash("error", "Classification name already exists. Please choose a different name.");
      return res.render("inv/add-classification", {
        title: "Add New Classification",
        classification_name,
        loggedIn: req.session.loggedIn,
        user: req.session.user,
        nav,
        errors: [{ msg: 'Classification name already exists.' }]
      });
    }

    // Insert the new classification into the database
    const result = await invModel.insertNewClassification({ classification_name, account_id });

    // Handle success response
    if (result) {
      req.flash('success', 'Classification added successfully!');
    } else {
      req.flash('error', 'Failed to add classification.');
    }
    res.redirect('/inv/management');
  } catch (error) {
    console.error("Error processing new classification:", error);  // Log the exact error
    req.flash("error", "There was an error processing your request.");
    res.redirect('/inv/add-classification');
  }
};


/* ***************************
 *  Week 04 - Render Add New Inventory (Vehicle) View
 * ************************** */
invCont.renderNewVehicleView = async function (req, res, next) {
  let nav = await utilities.getNav();
  try {
      // Fetch classification list from the database
      const classificationList  = await utilities.buildClassificationList();

      // Debug log to ensure classifications are being fetched
      //console.log('Classifications:', classifications);

      // Render the Add New Inventory (Vehicle) Form with classification list
      res.render("./inventory/addInventory", {
          title: "Add New Vehicle",
          nav,
          classificationList, // Pass the classifications to the template
          locals: req.body || {}, // Pass the body for sticky fields
          loggedIn: req.session.loggedIn,
          user: req.session.user,
          errors: null
      });
  } catch (error) {
      console.error("Error rendering new vehicle view:", error); // Log the exact error
      req.flash("error", "There was an error processing your request.");
      res.redirect('/inv/addInventory');
  }
}

/* ***************************
 *  Week 04 - Function to process the Add New Inventory (Vehicle) Form
 * ************************** */
invCont.processNewVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
  } = req.body;

  // Retrieve the account_id from the session
  const account_id = req.session.user.account_id;

  try {
      // Insert the new vehicle into the database
      const result = await invModel.insertNewVehicle({
          classification_id,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color,
          account_id
      });

      // Check if the insertion was successful
      if (result) {
        req.flash("success", "Vehicle added successfully!");
      } else {
        req.flash("error", "Failed to add vehicle.");
      }
      res.redirect("/inv/management");
  } catch (error) {
      console.error("Error processing new vehicle:", error);  // Log the exact error
      req.flash("error", "There was an error processing your request.");
      res.render("./inventory/addInventory", {
          title: "Add New Vehicle",
          classification_id,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color,
          nav, 
          loggedIn: req.session.loggedIn,
          user: req.session.user,
          errors: [{ msg: 'There was an error processing your request.' }]
      });
  }
}


/* ***************************
 *  week 05 - Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Week 05 - Render Edit Invetory View
 * ************************** */
invCont.renderEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInvDetail(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/editInventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    loggedIn: req.session.loggedIn,
    user: req.session.user,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  week 05 - Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    loggedIn: req.session.loggedIn,
    user: req.session.user,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Week 05 - Render Delete Invetory View
 * ************************** */
invCont.renderDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInvDetail(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    loggedIn: req.session.loggedIn,
    user: req.session.user,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Week 05 - Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventory(inv_id)

  // Check if the delete was successful
  if (deleteResult) {
      req.flash("success", `The Vehicle was successfully deleted.`);
      res.redirect("/inv/management");
  } else {
      // If delete failed, re-render the delete view with an error message
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("error", "Sorry, the deletion process failed.");
      res.render("./inventory/delete-confirm", {
          title: "Delete " + itemName,
          nav,
          loggedIn: req.session.loggedIn,
          user: req.session.user,
          errors: null,
          inv_id: itemData.inv_id,
          inv_make: itemData.inv_make,
          inv_model: itemData.inv_model,
          inv_year: itemData.inv_year,
          inv_price: itemData.inv_price,
      })
  
  }

}


module.exports = invCont