const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email (week 04)
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* week 05 - Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* week 05 - Return account data using account id
* ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1',
      [account_id]
    );
    return result.rows[0]; // return account data
  } catch (error) {
    throw new Error("Error fetching account by ID: " + error.message); // throw error
  }
}

/* *****************************
* week 05 - Update account information
* *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]); // Note the order
  } catch (error) {
    console.error("Error updating account:", error); // Log the error to console for debugging
    throw new Error("Error updating account: " + error.message); // Re-throw the error for handling in the controller
  }
}

/* *****************************
* week 05 - Update account password
* *************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2
    `;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount > 0; // return true if update is successful
  } catch (error) {
    throw new Error("Error updating password: " + error.message); // throw error
  }
}

module.exports = {
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail, 
  getAccountById, 
  updateAccount,
  updatePassword}