const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view (week 04)
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver registration view (week 04)
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration (week 04)
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password

   // Save user data to session (week 05) --> This is necessary to use the conditional statement inside the header partial view
   req.session.loggedIn = true;
   req.session.user = accountData;

   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }

/* ****************************************
* week 05 - Render the account management view
* *************************************** */
async function renderAccountManagement(req, res, next) {   
  let nav = await utilities.getNav(); 
  res.render("account/management", { 
    title: "Account Management", 
    nav, 
    errors: null,
    notice: req.flash('notice') // Add this line to pass the flash message
  });
}


/* ****************************************
*  week 05 - Render update account view
* *************************************** */
async function renderUpdateAccountView(req, res, next) {
  try {
      let nav = await utilities.getNav();
      const accountId = req.params.accountId;
      const accountData = await accountModel.getAccountById(accountId);

      if (!accountData) {
          req.flash("notice", "Account not found");
          return res.redirect("/account/management");
      }

      res.render("account/update", {
          title: "Update Account Information",
          nav,
          accountData,
          errors: null,
          loggedIn: req.session.loggedIn,
          user: req.session.user
      });
  } catch (error) {
      next(error);
      console.error("Error rendering update account view:", error);
  }
}

/* ****************************************
*  week 05 - Handle the update account process
* *************************************** */
async function processUpdateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { accountId } = req.params; // Should be the account ID
    const { account_firstname, account_lastname, account_email } = req.body; // Get the rest of the data from body

    // Call updateAccount with the correct order of parameters
    const result = await accountModel.updateAccount(accountId, account_firstname, account_lastname, account_email);

    if (result.rowCount > 0) { // Check if any rows were updated
      req.flash("notice", "Account information updated successfully");
      res.status(200).render('account/management', {
        title: 'Account Management',
        nav,
        loggedIn: req.session.loggedIn,
        user: req.session.user,
        errors: null,
      })
    } else {
      req.flash("notice", "Failed to update account information");
      // Re-render the update view with current account data
      const accountData = await accountModel.getAccountById(accountId);
      console.log(accountData)
      res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        accountData,
        errors: null,
        loggedIn: req.session.loggedIn,
        user: req.session.user,
      });
    }
  } catch (error) {
    console.error("Error in processUpdateAccount:", error); // Log any error
    next(error); // Call the next middleware or error handler
  }
}


/* ****************************************
*  week 05 - Handle the password change request
* *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_password } = req.body;
  const { accountId } = req.params; // Get accountId from params

  // Check if a new password is provided
  if (!account_password) {
    req.flash("notice", "No password was provided; no changes made to the password.");
    const updatedAccountData = await accountModel.getAccountById(accountId);
    
    return res.status(500).render("account/management", {
      title: "Account Management",
      nav,
      accountData: updatedAccountData,
      loggedIn: req.session.loggedIn,
      user: req.session.user,
      errors: null,
    });
  }

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10); // Use async version of bcrypt
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the new password.');
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      loggedIn: req.session.loggedIn,
      user: req.session.user,
    });
  }

  // Update the password in the database
  const result = await accountModel.updatePassword(accountId, hashedPassword); // Include accountId in the update
  
  if (result) {
    req.flash("notice", "Congratulations, you've successfully changed your password.");
    
    // Fetch updated account data for management view
    const updatedAccountData = await accountModel.getAccountById(accountId);
    
    return res.status(200).render("account/management", {
      title: "Account Management",
      nav,
      accountData: updatedAccountData,
      loggedIn: req.session.loggedIn,
      user: req.session.user,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, there was an error trying to update your password.");
    const updatedAccountData = await accountModel.getAccountById(accountId); // Get updated data
    
    return res.status(500).render("account/management", {
      title: "Account Management",
      nav,
      accountData: updatedAccountData,
      loggedIn: req.session.loggedIn,
      user: req.session.user,
      errors: null,
    });
  }
}

/* ****************************************
 * Week 05 - Handle the logout process
 **************************************** */
async function accountLogout(req, res, next) {
  // Set the flash message before destroying the session
  req.flash("notice", "You have successfully logged out.");
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return next(err); // Forward the error to the error handler
    }

    // Clear the JWT cookie
    res.clearCookie("jwt");

    // Redirect to the home page
    return res.redirect("/");
  });
}





module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  renderAccountManagement, 
  renderUpdateAccountView, 
  processUpdateAccount,
  updatePassword,
  accountLogout}