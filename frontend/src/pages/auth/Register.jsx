import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', {
        email: form.email,
      });

      setStep(2);
      setMessage('OTP berhasil dikirim ke email kamu.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.post('/auth/verify-register', {
        name: form.name,
        email: form.email,
        password: form.password,
        otp: form.otp,
      });

      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold">Register</h1>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nama"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email aktif"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold disabled:bg-slate-400"
            >
              {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyRegister} className="mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              Masukkan kode OTP yang dikirim ke {form.email}
            </p>

            <input
              type="text"
              name="otp"
              placeholder="Kode OTP"
              value={form.otp}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold disabled:bg-slate-400"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full border py-2 rounded-lg"
            >
              Ubah Email
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}

        <p className="mt-4 text-sm">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-green-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}