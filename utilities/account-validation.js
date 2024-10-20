const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
  *  Registration Data Validation Rules (week 04)
  * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration (week 04)
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

/* **********************************
*  Login Data Validation Rules (week 04)
* ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // password is required
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password is required and must meet the requirements: Passwords must be at least 12 characters and contain at least 1 number, 1 capital letter and 1 special character."),
  ];
};
  

/* ******************************
 * Check data and return errors or continue to login (week 04) --- NOT SURE ABOUT THIS BEING REQUIRED OR NOT
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email, account_password } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
      account_password
    })
    return
  }
  next()
}

/* ******************************
 * week 05 - Check update data and make sure email doesnt exists or is the same that the user already had
 * ***************************** */
validate.updateAccountRules = () => {
  return [
    // firstname is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    
    // lastname is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    
    // email must be valid and cannot already exist in the database, excluding the current user's email
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const currentAccountId = req.params.accountId; // Get the current account ID
        const emailExists = await accountModel.checkExistingEmail(account_email);
        const account = await accountModel.getAccountById(currentAccountId); // Get the current user's account

        if (emailExists && account.account_email !== account_email) {
          throw new Error("Email already exists. Please use a different email.");
        }
      })
  ];
};

/* ******************************
 * week 05 - Check data and return errors or continue to registration
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Update Account Information",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * week 05 - Update Password Validation
 * ***************************** */
validate.updatePasswordRules = () => {
  return [
    // password must be strong if provided
    body("account_password")
      .notEmpty() // Make sure the password is provided
      .withMessage("Please provide a password.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet the requirements.")
  ];
};

/* ******************************
 * Check Password Validation Results
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_password } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Account Information",
      nav,
      account_password,
    });
    return;
  }
  next();
};


module.exports = validate
