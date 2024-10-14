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

module.exports = validate;