import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sendOtpEmail } from '../services/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, role
      `,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Register berhasil',
      user: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password wajib diisi';
  }

  if (password.trim().length !== password.length) {
    return 'Password tidak boleh diawali atau diakhiri spasi';
  }

  if (password.length < 8) {
    return 'Password minimal 8 karakter';
  }

  if (password.length > 72) {
    return 'Password maksimal 72 karakter';
  }

  if (!/[A-Za-z]/.test(password)) {
    return 'Password harus mengandung huruf';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password harus mengandung angka';
  }

  return null;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email sudah terdaftar',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `
      INSERT INTO email_otps (email, otp_code, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
      `,
      [email, otp]
    );

    await sendOtpEmail(email, otp);

    res.json({
      message: 'OTP berhasil dikirim ke email',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyRegister = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email sudah terdaftar',
      });
    }

    const otpResult = await pool.query(
      `
      SELECT *
      FROM email_otps
      WHERE email = $1
      AND otp_code = $2
      AND is_used = false
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        message: 'OTP tidak valid atau sudah expired',
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
      message: passwordError,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `
      INSERT INTO users (name, email, password_hash, is_verified)
      VALUES ($1, $2, $3, true)
      RETURNING id, name, email, role, is_verified
      `,
      [name, email, hashedPassword]
    );

    await pool.query(
      `
      UPDATE email_otps
      SET is_used = true
      WHERE id = $1
      `,
      [otpResult.rows[0].id]
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: userResult.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};