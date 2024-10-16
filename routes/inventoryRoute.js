// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const baseController = require("../controllers/baseController");
const validate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Week 03 - Route to build a specific inventory item detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildInvDetail));

// Week 03 - Route to trigger the error
router.get("/error-trigger", utilities.handleErrors(baseController.buildIntentionalError));

// Week 04 - Route to render management view
router.get("/", utilities.handleErrors(invController.renderManagementView));

// Week 04 - Route to render add new classification view
router.get("/add-classification", utilities.handleErrors(invController.renderAddClassification));

// Week 04 - Route to handle form submission for adding classificaiton
router.post("/add-classification", 
    validate.classificationRules(),
    validate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

// Week 04 - Render new vehicle form
router.get("/addInventory", 
    utilities.handleErrors(invController.renderNewVehicleView))

// Week 04 - Process the addition of a new vehicle
router.post("/addInventory", 
    validate.inventoryRules(), 
    validate.checkInventoryData, 
    utilities.handleErrors(invController.processNewVehicle))

// week 05 - Route to the URL in the Javascript file 'inventory.js'
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// week 05 - Route to render the Editing Inventory View
router.get("/edit/:inv_id", utilities.handleErrors(invController.renderEditInventoryView))

// week 05 - Route to handle the inventory update request
router.post("/update/", 
    validate.inventoryRules(),
    validate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory))

// week 05 - Route to render the Delete Inventory View request
router.get("/delete/:inv_id", 
    //utilities.checkAdminOrEmployee,
    utilities.handleErrors(invController.renderDeleteInventoryView))

// week 05 - Route to Handle the inventory delete request
router.post("/deleteVehicle",
    //utilities.checkAdminOrEmployee,
    utilities.handleErrors(invController.deleteInventory)
)


module.exports = router;