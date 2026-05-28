import {
  X,
  Eye,
  EyeOff,
  Leaf,
  User,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useState } from 'react';
import api from '../api/axios';

export default function RegisterModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
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
    if (message) setMessage('');
  };

  const showMessage = (text, type = 'error') => {
    setMessage(text);
    setMessageType(type);
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

    const emailError = validateEmail(form.email);
    if (emailError) return showMessage(emailError);

    const passwordError = validatePassword(form.password);
    if (passwordError) return showMessage(passwordError);

    if (form.password !== form.confirmPassword) {
      return showMessage('Password dan konfirmasi password tidak sama.');
    }

    setStep(2);
    setMessage('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/auth/send-otp', { email: form.email });
      setStep(3);
      showMessage('OTP berhasil dikirim ke email kamu.', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Gagal mengirim OTP');
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

      showMessage('Registrasi berhasil. Silakan login.', 'success');
      setTimeout(onClose, 1200);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl">
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
                Buat Akun SisaBisa
              </h1>
              <p className="text-sm text-green-50">
                Mulai kelola inventory makananmu.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <StepBadge active={step >= 1} label="Akun" />
            <StepBadge active={step >= 2} label="OTP" />
            <StepBadge active={step >= 3} label="Verifikasi" />
          </div>
        </div>

        <div className="px-5 sm:px-6 py-5 sm:py-6 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <form onSubmit={handleContinue} className="space-y-4">
              <FieldWrapper label="Nama Lengkap" icon={User}>
                <input
                  name="name"
                  placeholder="Nama lengkap"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  required
                />
              </FieldWrapper>

              <FieldWrapper label="Email Aktif" icon={Mail}>
                <input
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  required
                />
              </FieldWrapper>

              <PasswordField
                label="Password"
                name="password"
                value={form.password}
                placeholder="Minimal 8 karakter"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                onChange={handleChange}
              />

              <PasswordField
                label="Konfirmasi Password"
                name="confirmPassword"
                value={form.confirmPassword}
                placeholder="Ulangi password"
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                onChange={handleChange}
              />

              <MessageBox message={message} type={messageType} />

              <button className="w-full rounded-2xl bg-green-600 py-3 font-bold text-white hover:bg-green-700">
                Lanjutkan
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="rounded-3xl bg-green-50 border border-green-100 p-5">
                <p className="text-sm text-slate-600">
                  Kode OTP akan dikirim ke:
                </p>
                <p className="font-bold text-green-700 mt-1 break-all">
                  {form.email}
                </p>
              </div>

              <MessageBox message={message} type={messageType} />

              <button
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:bg-slate-400"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Mengirim OTP...' : 'Kirim OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Ubah Data
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerifyRegister} className="space-y-4">
              <FieldWrapper label="Kode OTP" icon={ShieldCheck}>
                <input
                  name="otp"
                  placeholder="Masukkan kode OTP"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  required
                />
              </FieldWrapper>

              <MessageBox message={message} type={messageType} />

              <button
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:bg-slate-400"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Memverifikasi...' : 'Verifikasi & Daftar'}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Kembali
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBadge({ active, label }) {
  return (
    <div
      className={`rounded-2xl px-2 sm:px-3 py-2 text-center text-xs font-bold ${
        active
          ? 'bg-white text-green-700'
          : 'bg-white/10 text-green-50 border border-white/10'
      }`}
    >
      {label}
    </div>
  );
}

function FieldWrapper({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
    </div>
  );
}

function PasswordField({ label, name, value, placeholder, show, onToggle, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

        <input
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          required
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function MessageBox({ message, type }) {
  if (!message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
        type === 'success'
          ? 'border-green-100 bg-green-50 text-green-700'
          : 'border-red-100 bg-red-50 text-red-700'
      }`}
    >
      {message}
    </div>
  );
}