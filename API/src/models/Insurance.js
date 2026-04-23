const pool = require('../config/database');

class InsuranceModel {
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM insurance_options WHERE is_active = TRUE ORDER BY daily_price ASC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM insurance_options WHERE id = $1 AND is_active = TRUE',
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { name, description, daily_price, coverage_type } = data;
    const result = await pool.query(
      'INSERT INTO insurance_options (name, description, daily_price, coverage_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, daily_price, coverage_type]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(data[key]);
      paramCount++;
    });

    values.push(id);
    const query = `UPDATE insurance_options SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = InsuranceModel;