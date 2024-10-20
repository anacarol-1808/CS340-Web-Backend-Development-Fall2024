// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')

// Week 04 - "GET" route for the path that will be sent when the "My Account" link is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Week 04 - Route to the accountRoute file, to start the delivery of the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Week 04 - Route to Process the Registration
// Process the registration data (week 04) - using the server validation tools
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// week 05 - Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// week 05 - Default route for account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.renderAccountManagement))

// Week 05 - Route to render the update account view
router.get("/update/:accountId", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.renderUpdateAccountView)
);

// Week 05 - Route to process the update account form
router.post("/update/:accountId", 
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.processUpdateAccount)
);

// Week 05 - Route to process the update password form
router.post("/update-password/:accountId", 
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;