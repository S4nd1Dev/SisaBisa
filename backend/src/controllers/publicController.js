import pool from '../config/db.js';

export const checkExpiry = async (req, res) => {
  try {
    const { ingredient_id, storage, purchase_date } = req.body;

    if (!ingredient_id || !storage || !purchase_date) {
      return res.status(400).json({
        message: 'ingredient_id, storage, dan purchase_date wajib diisi',
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM ingredient_expiry
      WHERE ingredient_id = $1
      AND LOWER(storage) = LOWER($2)
      LIMIT 1
      `,
      [ingredient_id, storage.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Data bahan dengan storage tersebut tidak ditemukan',
      });
    }

    const ingredient = result.rows[0];

    const purchaseDate = new Date(purchase_date);
    const expiredDate = new Date(purchaseDate);

    expiredDate.setDate(expiredDate.getDate() + ingredient.days);

    res.json({
      message: 'Estimasi expired berhasil dihitung',
      data: {
        ingredient_id: ingredient.ingredient_id,
        item: ingredient.item,
        category: ingredient.category,
        storage: ingredient.storage,
        shelf_life_days: ingredient.days,
        purchase_date,
        estimated_expired_at: expiredDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const searchIngredients = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === '') {
      return res.status(400).json({
        message: 'Query search wajib diisi',
      });
    }

    const result = await pool.query(
      `
      SELECT DISTINCT ON (ingredient_id)
        ingredient_id,
        item,
        category
      FROM ingredient_expiry
      WHERE item ILIKE $1
      ORDER BY ingredient_id, item ASC
      LIMIT 10
      `,
      [`%${search.trim()}%`]
    );

    res.json({
      message: 'Berhasil mengambil suggestion bahan',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};