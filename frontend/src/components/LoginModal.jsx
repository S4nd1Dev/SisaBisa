import { X, Eye, EyeOff, Leaf, Mail, LockKeyhole, Loader2 } from 'lucide-react';
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
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (message) setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/login', form);
      login(response.data.user, response.data.token);
      onClose();

      navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm overflow-y-auto">
        <div className="relative my-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <X size={18} />
          </button>

          <div className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 px-5 sm:px-6 py-6 sm:py-7 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/20 border border-white/20">
                <Leaf size={23} />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold">
                  Masuk ke SisaBisa
                </h1>
                <p className="text-sm text-green-50">
                  Kelola inventory makananmu.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 py-5 sm:py-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-semibold text-green-700 hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
              </div>

              {message && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:bg-slate-400"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Masuk...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
}