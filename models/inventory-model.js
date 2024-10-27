const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Week 06 - Get approved classification data with at least one approved inventory item
 * ************************** */
async function getApprovedClassifications() {
  return await pool.query(`
    SELECT c.classification_id, c.classification_name 
    FROM public.classification c
    JOIN public.inventory i ON c.classification_id = i.classification_id
    WHERE c.classification_approved = true
      AND i.inv_approved = true
    GROUP BY c.classification_id
    HAVING COUNT(i.inv_id) > 0
    ORDER BY c.classification_name
  `)
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Week 06 - Get all approved inventory items and classification_name by classification_id
 * ************************** */
async function getApprovedInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1
      AND i.inv_approved = true
      AND c.classification_approved = true`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getApprovedInventoryByClassificationId error " + error)
  }
}


/* ***************************
 *  Week 03 - Get data for a specific vehicle in inventory (using inv_id)
 * ************************** */
async function getInvDetail(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInvDetail error" + error)
  }
}

/* ***************************
 *  Week 04 - Function to check if a classification name exists
 * ************************** */
async function checkExistingClassification(classification_name) {
  const query = `
      SELECT * FROM classification WHERE classification_name = $1`;
  const values = [classification_name];

  try {
      const { rows } = await pool.query(query, values);
      return rows.length > 0; // Returns true if classification exists, otherwise false
  } catch (error) {
      throw error;
  }
}

/* ***************************
 *  Week 04 - Function to insert a new classification into the database
 * ************************** */
async function insertNewClassification(newClassification) {
  const {classification_name, account_id} = newClassification;

  const query = `
    INSERT INTO classification 
    (classification_name, submitter_account_id, classification_creation_date)
    VALUES ($1, $2, $3)
    RETURNING *`;

  const values = [classification_name, account_id, new Date()];

  try {
      const {rows} = await pool.query(query, values);
      return rows[0]; // Return the inserted row if needed
  } catch (error) {
      throw error;
  }
}

/* ***************************
 *  week 04 - Insert New Vehicle
 * ************************** */
async function insertNewVehicle(newVehicle) {
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
      inv_color,
      account_id
  } = newVehicle;

  const query = `
    INSERT INTO inventory (
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
      submitter_account_id,
      inventory_creation_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`;

  const values = [
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
    account_id,          // submitter_account_id
    new Date()           // inv_creation_date
  ];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0]; // Return the inserted row if needed
  } catch (error) {
    console.error("insertNewVehicle error", error);
    throw error;
  }dev
}

/* ***************************
 *  Week 05 - Update Inventory
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

 /* ***************************
 *  Week 05 - Delete Inventory
 * ************************** */
 async function deleteInventory(inv_id) {
  try {
    const sql =
      "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("model error: " + error)
    new Error("Delete Inventory Error")
  }
}

/* ***************************
 *  Week 06 - Get all Classifications that are pending approval
 * ************************** */
async function getPendingApprovalClassificationList () {
  try {
    const sql = `
      SELECT 
          c.classification_id,
          c.classification_name,
          c.classification_creation_date,
          a.account_firstname AS account_firstname,
          a.account_lastname AS account_lastname
      FROM 
          classification c
      JOIN 
          account a ON c.submitter_account_id = a.account_id
      WHERE 
          c.classification_approved = false
    `;
    const result = await pool.query(sql);
    return result.rows; // Adjust based on your database library; if using pg-pool, you might need to access `result.rows`.
  } catch (error) {
    console.error("Error fetching classifications pending approval:", error);
    throw error;
  }
};

/* ***************************
 *  week 06 - Get all Inventory that are pending approval
 * ************************** */
async function getPendingApprovalInventoryList() {
  try {
    const sql = `
      SELECT 
          i.inv_id,
          i.inv_make,
          i.inv_model,
          i.inv_description,
          i.inv_image,
          i.inv_thumbnail,
          i.inv_price,
          i.inv_year,
          i.inv_miles,
          i.inv_color,
          a.account_firstname AS account_firstname,
          a.account_lastname AS account_lastname,
          c.classification_name AS classification_name
      FROM 
          inventory i
      JOIN 
          account a ON i.submitter_account_id = a.account_id
      JOIN 
          classification c ON i.classification_id = c.classification_id
      WHERE 
          i.inv_approved = false
    `;
    const result = await pool.query(sql);
    return result.rows; // Adjust based on your database library.
  } catch (error) {
    console.error("Error fetching inventory items pending approval:", error);
    throw error;
  }
}

/* ***************************
 *  Week 06 - Approve Classification
 * ************************** */
async function approveClassification(classification_id, admin_account_id) {
  const sql = `
    UPDATE classification
    SET classification_approved = true,
        approver_account_id = $2,
        classification_approval_date = $3
    WHERE classification_id = $1
  `;
  const approvalDate = new Date(); // Get the current date and time
  await pool.query(sql, [classification_id, admin_account_id, approvalDate]);
}

/* ***************************
 *  Week 06 - Approve Inventory
 * ************************** */
async function approveInventory(inv_id, admin_account_id) {
  const sql = `
    UPDATE inventory
    SET inv_approved = true,
        approver_account_id = $2,
        Inventory_approval_date = $3
    WHERE inv_id = $1
  `;
  const approvalDate = new Date(); // Get the current date and time
  await pool.query(sql, [inv_id, admin_account_id, approvalDate]);
}


 /* ***************************
 *  Week 06 - Delete Classification
 * ************************** */
async function deleteClassification(classification_id) {
  const sql = `DELETE FROM classification WHERE classification_id = $1`;
  await pool.query(sql, [classification_id]);
}



module.exports = {
  getClassifications, 
  getApprovedClassifications,
  getInventoryByClassificationId, 
  getApprovedInventoryByClassificationId,
  getInvDetail, 
  checkExistingClassification, 
  insertNewClassification, 
  insertNewVehicle, 
  updateInventory,
  deleteInventory,
  getPendingApprovalClassificationList,
  getPendingApprovalInventoryList,
  deleteClassification,
  approveClassification,
  approveInventory}