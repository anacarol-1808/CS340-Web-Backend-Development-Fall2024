const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

/* ***************************
 *  Weeok 03 - Build intentional error 
 * ************************** */
baseController.buildIntentionalError = async function (req, res, next) {
  const error = new Error('This is a 500 error triggered intentionally.');
  error.status = 500;
  next(error); // Pass the error to the middleware
};

module.exports = baseController