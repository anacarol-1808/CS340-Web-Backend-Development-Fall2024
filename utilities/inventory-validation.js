const { body, validationResult } = require("express-validator");
const utilities = require(".");
const validate = {};
const invModel = require("../models/inventory-model");

/* **********************************
*  Week 04 - Add New Classification Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
    return [
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isAlpha()
        .withMessage("Classification name must contain only alphabetic characters with no spaces.")
        .custom(async (classification_name) => {
            const exists = await invModel.checkExistingClassification(classification_name);
            if (exists) {
              throw new Error("Classification name already exists. Please use a different name.");
            }
        })
    ];
  };
  
/* ******************************
* Week 04 - Check data and return errors or continue to add classification
* ***************************** */
validate.checkClassificationData = async (req, res, next) => {
const { classification_name } = req.body;

let errors = validationResult(req);
if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
    errors,
    title: "Add New Classification",
    nav,
    classification_name,
    });
    return;
}
next();
};

/* **********************************
*  Week 04 - Add New Inventory Data Validation Rules
* ********************************* */
validate.inventoryRules = () => { // inventoryRules(): This middleware function contains the rules to validate and sanitize the input data.
  return [
    // inv_make is required and must be a string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle make."),

    // inv_model is required and must be a string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle model."),

    // inv_year is required and must be a valid year
    body("inv_year")
      .trim()
      .isInt({ min: 1500, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid vehicle year."),

    // inv_color is required and must be a string
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle color."),

    // inv_price is required and must be a valid number
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid vehicle price."),

    // inv_miles is required and must be a valid number
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid vehicle mileage."),

    // inv_description is required and must be a string
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a vehicle description."),

    // classification_id is required and must be a valid number
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification."),
  ];
};

/* ******************************
 * Week 04 - Check data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => { // checkInventoryData: This middleware function checks the data against the validation rules and handles any errors by re-rendering the form with the errors and previously entered data.
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_color,
    inv_price,
    inv_miles,
    inv_image,
    inv_thumbnail,
    inv_description,
    classification_id,
  } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.render("./inventory/addInventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      inv_image,
      inv_thumbnail,
      inv_description,
      classification_id,
    });
    return;
  }
  next();
};


module.exports = validate;