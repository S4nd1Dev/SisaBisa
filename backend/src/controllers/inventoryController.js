import pool from '../config/db.js';

export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM user_inventory
      WHERE user_id = $1
      ORDER BY expired_at ASC
      `,
      [req.user.id]
    );

    res.json({
      message: 'Berhasil mengambil inventory',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { ingredient_name, quantity, unit, expired_at } = req.body;

    const result = await pool.query(
      `
      INSERT INTO user_inventory
      (user_id, ingredient_name, quantity, unit, expired_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [req.user.id, ingredient_name, quantity, unit, expired_at]
    );

    res.status(201).json({
      message: 'Inventory berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredient_name, quantity, unit, expired_at } = req.body;

    const result = await pool.query(
      `
      UPDATE user_inventory
      SET ingredient_name = $1,
          quantity = $2,
          unit = $3,
          expired_at = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
      `,
      [ingredient_name, quantity, unit, expired_at, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Inventory tidak ditemukan',
      });
    }

    res.json({
      message: 'Inventory berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM user_inventory
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Inventory tidak ditemukan',
      });
    }

    res.json({
      message: 'Inventory berhasil dihapus',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};