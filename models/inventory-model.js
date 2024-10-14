const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
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
  const {classification_name} = newClassification;

  const query = `INSERT INTO classification (classification_name)
  VALUES ($1)
  RETURNING *`;

  const values = [classification_name]

  try {
      const {rows} = await pool.query(query, values)
      return rows[0] // Return the inserted row if needed
  } catch (error) {
      throw error;
  }

}



module.exports = {getClassifications, getInventoryByClassificationId, getInvDetail, checkExistingClassification, insertNewClassification}