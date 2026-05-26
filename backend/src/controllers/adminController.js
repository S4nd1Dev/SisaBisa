import pool from '../config/db.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await pool.query(`
      SELECT COUNT(*)::int AS total FROM users
    `);

    const totalInventory = await pool.query(`
      SELECT COUNT(*)::int AS total FROM user_inventory
    `);

    const totalFavorites = await pool.query(`
      SELECT COUNT(*)::int AS total FROM favorite_recipes
    `);

    const expiredItems = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM user_inventory
      WHERE expired_at < CURRENT_DATE
    `);

    return res.json({
      message: 'Admin stats berhasil diambil',
      data: {
        total_users: totalUsers.rows[0].total,
        total_inventory: totalInventory.rows[0].total,
        total_favorites: totalFavorites.rows[0].total,
        expired_items: expiredItems.rows[0].total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};