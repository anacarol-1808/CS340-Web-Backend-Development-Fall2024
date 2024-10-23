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
    (classification_name, account_id, classification_approved, classification_approval_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;

  const values = [classification_name, account_id, false, new Date()];

  try {
      const {rows} = await pool.query(query, values);
      return rows[0]; // Return the inserted row if needed
  } catch (error) {
      throw error;
  }
}

/* ***************************
 *  Week 04 - Insert New Vehicle
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
      account_id,
      inv_approved,
      inv_approved_date
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  RETURNING *`

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
      account_id,
      false,
      new Date()
  ];

  try {
      const { rows } = await pool.query(query, values)
      return rows[0] // Return the inserted row if needed
  } catch (error) {
      console.error("insertNewVehicle error", error)
      throw error
  }
  
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


module.exports = {
  getClassifications, 
  getApprovedClassifications,
  getInventoryByClassificationId, 
  getInvDetail, 
  checkExistingClassification, 
  insertNewClassification, 
  insertNewVehicle, 
  updateInventory,
  deleteInventory}