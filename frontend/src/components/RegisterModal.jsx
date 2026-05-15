import { X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';

export default function RegisterModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!regex.test(email.trim())) return 'Format email tidak valid';
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password minimal 8 karakter';
    if (!/[A-Za-z]/.test(password)) return 'Password harus mengandung huruf';
    if (!/[0-9]/.test(password)) return 'Password harus mengandung angka';
    return null;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setMessage('');

    const emailError = validateEmail(form.email);
    if (emailError) return setMessage(emailError);

    const passwordError = validatePassword(form.password);
    if (passwordError) return setMessage(passwordError);

    if (form.password !== form.confirmPassword) {
      return setMessage('Password dan konfirmasi password tidak sama.');
    }

    setStep(2);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/send-otp', { email: form.email });
      setStep(3);
      setMessage('OTP berhasil dikirim ke email kamu.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/verify-register', {
        name: form.name,
        email: form.email,
        password: form.password,
        otp: form.otp,
      });

      setMessage('Registrasi berhasil. Silakan login.');
      setTimeout(onClose, 1200);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-slate-700 text-white rounded-full p-1"
        >
          <X size={18} />
        </button>

        <h1 className="text-3xl font-bold text-slate-800">REGISTER</h1>
        <p className="text-sm text-slate-500 mt-1">
          Buat akun untuk menyimpan dan memonitor bahan makanan.
        </p>

        {step === 1 && (
          <form onSubmit={handleContinue} className="mt-6 space-y-4">
            <input
              name="name"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Aktif"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Konfirmasi Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">
              Lanjutkan
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-slate-600">
                Kode OTP akan dikirim ke:
              </p>
              <p className="font-semibold mt-1">{form.email}</p>
            </div>

            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full border py-3 rounded-lg"
            >
              Ubah Data
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyRegister} className="mt-6 space-y-4">
            <input
              name="otp"
              placeholder="Kode OTP"
              value={form.otp}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-sm text-center text-slate-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}