import { X, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      });

      login(response.data.user, response.data.token);

      onClose();

      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-slate-700 text-white rounded-full p-1"
          >
            <X size={18} />
          </button>

          <h1 className="text-3xl font-bold text-slate-800">
            LOGIN
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Masuk untuk mengakses inventory bahan makanan.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
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
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-slate-400"
            >
              {loading ? 'Masuk...' : 'Login'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-center text-red-600">
              {message}
            </p>
          )}
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </>
  );
}