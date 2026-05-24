import axios from 'axios';
import pool from '../config/db.js';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const inventoryResult = await pool.query(
      `
      SELECT ingredient_name, expired_at
      FROM user_inventory
      WHERE user_id = $1
      ORDER BY expired_at ASC
      `,
      [userId]
    );

    const items = inventoryResult.rows;

    if (items.length === 0) {
      return res.status(404).json({
        message: 'Inventory masih kosong',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bahanUser = items.map((item) => item.ingredient_name).join(', ');

    const bahanMauBasi = items
      .filter((item) => {
        const expiredDate = new Date(item.expired_at);
        expiredDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil(
          (expiredDate - today) / (1000 * 60 * 60 * 24)
        );

        return diffDays >= 0 && diffDays <= 3;
      })
      .map((item) => item.ingredient_name)
      .join(', ');

    if (!bahanMauBasi) {
      return res.status(400).json({
        message: 'Belum ada bahan yang hampir expired',
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/api/rekomendasi`,
      {
        bahan_user: bahanUser,
        bahan_mau_basi: bahanMauBasi,
      }
    );

    res.json({
      message: 'Rekomendasi resep berhasil diambil',
      data: aiResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message,
    });
  }
};

export const getManualRecommendations = async (req, res) => {
  try {
    const { bahan_user, bahan_mau_basi } = req.body;

    if (!bahan_user || !bahan_mau_basi) {
      return res.status(400).json({
        message: 'bahan_user dan bahan_mau_basi wajib diisi',
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/api/rekomendasi`,
      {
        bahan_user,
        bahan_mau_basi,
      }
    );

    res.json({
      message: 'Rekomendasi manual berhasil diambil',
      data: aiResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message,
    });
  }
};

export const getRecipeDetail = async (req, res) => {
  try {
    const { nama_menu, bahan_resep } = req.body;

    if (!nama_menu || !bahan_resep) {
      return res.status(400).json({
        message: 'nama_menu dan bahan_resep wajib diisi',
      });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_API_URL}/api/detail-resep`,
      {
        nama_menu,
        bahan_resep,
      }
    );

    const aiData = aiResponse.data;

    const detail = aiData.data || aiData.result || aiData.results || aiData;

    const normalizedDetail = {
      nama_menu: detail.nama_menu || nama_menu,
      bahan_resep: detail.bahan_resep || bahan_resep,

      langkah_memasak:
        detail.langkah_memasak ||
        detail.langkah ||
        detail.steps ||
        [],

      nutrisi: {
        kalori:
          detail.nutrisi?.kalori ||
          detail.kalori ||
          '-',

        protein:
          detail.nutrisi?.protein ||
          detail.protein ||
          '-',

        lemak:
          detail.nutrisi?.lemak ||
          detail.lemak ||
          '-',

        karbohidrat:
          detail.nutrisi?.karbohidrat ||
          detail.karbohidrat ||
          '-',
      },

      raw_response: aiData,
    };

    res.json({
      message: 'Detail resep berhasil diambil',
      data: normalizedDetail,
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message,
    });
  }
};