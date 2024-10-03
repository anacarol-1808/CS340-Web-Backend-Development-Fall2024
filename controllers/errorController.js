const utilities = require("../utilities/")
const errorController = {}

/* ***************************
 *  Weeok 03 - Build intentional error 
 * ************************** */
errorController.buildIntentionalError = async function (req, res, next) {
    const errorView = await utilities.buildIntentionalErrorView 
    let nav = await utilities.getNav() 
    res.render("./errors/intentional", { 
        title: "Intentional Error View 500", 
        nav, 
        errorView
    })
}