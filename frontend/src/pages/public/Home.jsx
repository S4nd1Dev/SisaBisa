import { Link } from 'react-router-dom';
import ExpiryChecker from './ExpiryChecker';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl text-green-700">
            SisaBisa
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-600 hover:text-green-700 font-medium"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-green-700 font-semibold mb-3">
              Smart Food Inventory
            </p>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Kelola bahan makanan sebelum terbuang sia-sia.
            </h1>

            <p className="text-slate-600 mt-5 text-lg">
              SisaBisa membantu kamu memantau tanggal kadaluarsa bahan,
              menerima pengingat email, dan nantinya mendapatkan rekomendasi
              resep dari bahan yang hampir expired.
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                to="/register"
                className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Mulai Sekarang
              </Link>

              <Link
                to="/login"
                className="bg-white border px-5 py-3 rounded-lg font-semibold"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              Coba cek estimasi kadaluarsa
            </h2>

            <ExpiryChecker compact />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-14 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-lg">Inventory Pintar</h3>
            <p className="text-slate-600 mt-2">
              Simpan bahan makanan dan pantau masa kadaluarsanya.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-lg">Email Reminder</h3>
            <p className="text-slate-600 mt-2">
              Dapatkan notifikasi email saat bahan mendekati expired.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-lg">Rekomendasi Resep</h3>
            <p className="text-slate-600 mt-2">
              Rekomendasi resep dari bahan hampir expired akan tersedia setelah
              model AI siap.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}