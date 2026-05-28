import { useState } from 'react';
import {
  Leaf,
  Bell,
  ChefHat,
  ArrowRight,
  Sparkles,
  PackageCheck,
  Recycle,
  Clock,
  MailCheck,
  ShieldCheck,
  CheckCircle,
  Search,
} from 'lucide-react';
import RegisterModal from '../../components/RegisterModal';
import LoginModal from '../../components/LoginModal';
import ExpiryChecker from './ExpiryChecker';

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-100">
              <Leaf size={21} />
            </div>

            <div className="text-left">
              <h1 className="font-extrabold text-xl sm:text-2xl text-green-700">
                SisaBisa
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 -mt-1">
                Smart Food Inventory
              </p>
            </div>
          </button>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-slate-700 hover:text-green-700 hover:bg-green-50 transition text-sm sm:text-base"
            >
              Login
            </button>

            <button
              onClick={() => setShowRegister(true)}
              className="bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition shadow-sm text-sm sm:text-base"
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#22c55e26,transparent_35%),radial-gradient(circle_at_bottom_right,#14b8a626,transparent_30%)]" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                <Sparkles size={16} />
                Smart Food Waste Prevention
              </div>

              <h2 className="mt-6 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-950">
                Kelola bahan makanan sebelum terbuang sia-sia.
              </h2>

              <p className="mt-6 text-base md:text-xl leading-relaxed text-slate-600 max-w-2xl">
                SisaBisa membantu kamu mencatat bahan makanan, memantau masa
                kadaluarsa, mendapatkan pengingat, dan menemukan ide resep dari
                bahan yang hampir expired.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowRegister(true)}
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold transition shadow-sm"
                >
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-6 py-4 rounded-2xl font-bold transition"
                >
                  Login
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat title="Storage Rules" value="3 Mode" />
                <MiniStat title="Resep Pintar" value="AI" />
                <MiniStat title="Reminder" value="Email" />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-green-200/40 blur-3xl rounded-[2rem]" />

              <div className="relative bg-white rounded-[2rem] shadow-xl border border-slate-100 p-5 md:p-6">
                <div className="mb-5">
                  <p className="text-sm font-bold text-green-700">
                    Coba Sekarang
                  </p>

                  <h3 className="text-2xl md:text-3xl font-extrabold mt-1">
                    Cek Estimasi Kadaluarsa
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Cari bahan, pilih penyimpanan, lalu lihat estimasi expired.
                  </p>
                </div>

                <ExpiryChecker compact />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <p className="text-green-700 font-bold">Fitur Utama</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2">
              Satu aplikasi untuk mengurangi food waste
            </h2>
            <p className="text-slate-600 mt-3">
              Dirancang agar pengguna mudah menyimpan bahan, memantau expired,
              dan memanfaatkan bahan sebelum terbuang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={PackageCheck}
              title="Inventory Pintar"
              description="Simpan bahan makanan berdasarkan jumlah, satuan, storage, dan tanggal pembelian."
            />

            <FeatureCard
              icon={Bell}
              title="Email Reminder"
              description="Pengguna mendapatkan pengingat ketika bahan mendekati tanggal expired."
            />

            <FeatureCard
              icon={ChefHat}
              title="Rekomendasi Resep AI"
              description="Temukan ide masakan dari bahan yang hampir expired agar lebih bermanfaat."
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <InfoPanel
              icon={Search}
              title="Cari bahan"
              text="User cukup mencari bahan dari master data yang sudah dikelola admin."
            />

            <InfoPanel
              icon={Clock}
              title="Hitung expired"
              text="Sistem menghitung estimasi expired berdasarkan storage rules."
            />

            <InfoPanel
              icon={CheckCircle}
              title="Gunakan tepat waktu"
              text="Bahan yang hampir expired bisa segera digunakan untuk resep."
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-stretch">
            <div className="rounded-[2rem] bg-slate-900 text-white p-6 md:p-8 overflow-hidden relative">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-green-500/20" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 text-green-300 font-bold text-sm">
                  <Recycle size={18} />
                  Reduce Food Waste
                </div>

                <h3 className="mt-4 text-3xl md:text-4xl font-extrabold">
                  Bahan makanan lebih terpantau, makanan tidak mudah terbuang.
                </h3>

                <p className="mt-4 text-slate-300 leading-relaxed">
                  SisaBisa membantu membangun kebiasaan menyimpan dan memakai
                  bahan makanan secara lebih bijak.
                </p>

                <button
                  onClick={() => setShowRegister(true)}
                  className="mt-6 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold transition"
                >
                  Daftar Gratis
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <BenefitCard
                icon={ShieldCheck}
                title="Data bahan terkontrol"
                text="Ingredient master dikelola admin agar data penyimpanan lebih konsisten."
              />

              <BenefitCard
                icon={MailCheck}
                title="Reminder otomatis"
                text="Pengguna bisa lebih cepat tahu bahan mana yang perlu diprioritaskan."
              />

              <BenefitCard
                icon={Leaf}
                title="Ramah lingkungan"
                text="Membantu mengurangi kebiasaan membuang bahan makanan."
              />

              <BenefitCard
                icon={ChefHat}
                title="Lebih praktis"
                text="Rekomendasi resep membantu pengguna memanfaatkan bahan yang tersedia."
              />
            </div>
          </div>
        </section>
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {showRegister && (
        <RegisterModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

function MiniStat({ title, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition">
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{title}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition">
      <div className="h-12 w-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-5 group-hover:bg-green-600 group-hover:text-white transition">
        <Icon size={23} />
      </div>

      <h3 className="font-extrabold text-lg text-slate-900">{title}</h3>

      <p className="text-slate-600 mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

function InfoPanel({ icon: Icon, title, text }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="bg-slate-100 text-slate-700 rounded-2xl p-3">
          <Icon size={22} />
        </div>

        <div>
          <h3 className="font-extrabold text-slate-900">{title}</h3>
          <p className="text-slate-600 mt-1 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, text }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition">
      <div className="h-11 w-11 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
        <Icon size={21} />
      </div>

      <h3 className="font-extrabold text-slate-900">{title}</h3>

      <p className="text-slate-600 mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}