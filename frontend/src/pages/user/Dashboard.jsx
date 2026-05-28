import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Bot,
  ChefHat,
  Plus,
  Bookmark,
  ArrowRight,
  Refrigerator,
  Sparkles,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../layouts/UserLayout';

function StatCard({ title, value, icon: Icon, color, bg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </h2>
        </div>

        <div className={`${bg} ${color} p-3 rounded-2xl`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDiffDays = (expiredAt) => {
    const expiredDate = new Date(expiredAt);
    expiredDate.setHours(0, 0, 0, 0);

    return Math.ceil(
      (expiredDate - today) / (1000 * 60 * 60 * 24)
    );
  };

  const expiredItems = items.filter((item) => getDiffDays(item.expired_at) < 0);

  const soonExpiredItems = items.filter((item) => {
    const diffDays = getDiffDays(item.expired_at);
    return diffDays >= 0 && diffDays <= 3;
  });

  const attentionItems = [...expiredItems, ...soonExpiredItems];

  useEffect(() => {
    let ignore = false;

    const fetchDashboardData = async () => {
      try {
        const [inventoryResponse, favoriteResponse] = await Promise.all([
          api.get('/inventory'),
          api.get('/favorites'),
        ]);

        const inventoryData = inventoryResponse.data.data || [];
        const favoriteData = favoriteResponse.data.data || [];

        if (ignore) return;

        setItems(inventoryData);
        setFavoriteCount(favoriteData.length);

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const expiredCount = inventoryData.filter((item) => {
          const expiredDate = new Date(item.expired_at);
          expiredDate.setHours(0, 0, 0, 0);
          return expiredDate < currentDate;
        }).length;

        const soonCount = inventoryData.filter((item) => {
          const expiredDate = new Date(item.expired_at);
          expiredDate.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (expiredDate - currentDate) / (1000 * 60 * 60 * 24)
          );

          return diffDays >= 0 && diffDays <= 3;
        }).length;

        if (expiredCount > 0) {
          toast.error(`${expiredCount} bahan sudah expired`);
        } else if (soonCount > 0) {
          toast(`${soonCount} bahan hampir expired`, {
            icon: '⚠️',
          });
        }
      } catch {
        toast.error('Gagal memuat dashboard');
      }
    };

    fetchDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6">
        {attentionItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-amber-200 bg-amber-50 p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex gap-4">
                <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl h-fit">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="font-bold text-amber-900">
                    Ada bahan yang perlu segera digunakan
                  </h2>

                  <p className="text-sm text-amber-800 mt-1">
                    {expiredItems.length > 0 &&
                      `${expiredItems.length} bahan sudah expired. `}
                    {soonExpiredItems.length > 0 &&
                      `${soonExpiredItems.length} bahan hampir expired.`}
                  </p>
                </div>
              </div>

              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-2xl font-semibold"
              >
                Cari Resep AI
                <ArrowRight size={17} />
              </Link>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 p-6 md:p-8 text-white shadow-sm"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-sm font-medium">
                <Sparkles size={15} />
                Smart Food Management
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
                Halo, {user?.name || 'User'}
              </h1>

              <p className="text-green-50 mt-4 text-sm md:text-lg leading-relaxed max-w-2xl">
                Pantau bahan makanan, cegah food waste, dan dapatkan ide resep
                dari AI berdasarkan inventory yang kamu punya.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3 min-w-full xl:min-w-[360px]">
              <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
                <p className="text-sm text-green-50">Inventory</p>
                <p className="text-2xl font-bold mt-1">{items.length}</p>
              </div>

              <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
                <p className="text-sm text-green-50">Hampir Expired</p>
                <p className="text-2xl font-bold mt-1">
                  {soonExpiredItems.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
                <p className="text-sm text-green-50">Expired</p>
                <p className="text-2xl font-bold mt-1">
                  {expiredItems.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 border border-white/20 p-4">
                <p className="text-sm text-green-50">Favorit</p>
                <p className="text-2xl font-bold mt-1">{favoriteCount}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-5 py-3 rounded-2xl font-bold hover:bg-green-50 transition"
            >
              <Plus size={18} />
              Tambah Inventory
            </Link>

            <Link
              to="/recommendations"
              className="inline-flex items-center justify-center gap-2 bg-green-900/25 border border-white/25 text-white px-5 py-3 rounded-2xl font-bold hover:bg-green-900/35 transition"
            >
              <ChefHat size={18} />
              Rekomendasi AI
            </Link>

            <Link
              to="/favorites"
              className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/25 text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/20 transition"
            >
              <Bookmark size={18} />
              Favorit
            </Link>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Bahan"
            value={items.length}
            icon={Package}
            color="text-blue-700"
            bg="bg-blue-100"
            index={0}
          />

          <StatCard
            title="Hampir Expired"
            value={soonExpiredItems.length}
            icon={AlertTriangle}
            color="text-amber-700"
            bg="bg-amber-100"
            index={1}
          />

          <StatCard
            title="Sudah Expired"
            value={expiredItems.length}
            icon={CheckCircle}
            color="text-red-700"
            bg="bg-red-100"
            index={2}
          />

          <StatCard
            title="Resep Favorit"
            value={favoriteCount}
            icon={Bookmark}
            color="text-green-700"
            bg="bg-green-100"
            index={3}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
                <Bot size={22} />
              </div>

              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Insight AI Hari Ini
                </h2>

                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  {attentionItems.length > 0
                    ? `Ada ${attentionItems.length} bahan yang perlu segera diperhatikan. Gunakan rekomendasi AI agar bahan tidak terbuang.`
                    : items.length === 0
                      ? 'Inventory kamu masih kosong. Tambahkan bahan pertama agar AI bisa memberi rekomendasi resep.'
                      : favoriteCount > 0
                        ? `Semua bahan terlihat aman. Kamu juga sudah menyimpan ${favoriteCount} resep favorit.`
                        : 'Semua bahan terlihat aman. Tetap pantau inventory secara rutin agar bahan makanan tidak terbuang.'}
                </p>

                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-2 mt-5 text-green-700 font-bold text-sm hover:underline"
                >
                  Buka rekomendasi
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Bahan yang Perlu Diperhatikan
                </h2>
                <p className="text-sm text-slate-500">
                  Prioritaskan bahan yang sudah atau hampir expired.
                </p>
              </div>

              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 text-green-700 font-bold text-sm hover:underline"
              >
                Lihat Inventory
                <ArrowRight size={16} />
              </Link>
            </div>

            {attentionItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-green-100 text-green-700 w-16 h-16 rounded-3xl flex items-center justify-center">
                  <CheckCircle size={30} />
                </div>

                <h3 className="font-bold mt-4 text-slate-900">
                  Semua bahan masih aman
                </h3>

                <p className="text-slate-500 mt-1 text-sm">
                  Tidak ada bahan yang perlu perhatian khusus hari ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {attentionItems.map((item, index) => {
                  const diffDays = getDiffDays(item.expired_at);
                  const isExpired = diffDays < 0;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-2xl ${
                            isExpired
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Refrigerator size={20} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 capitalize">
                            {item.ingredient_name}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            Expired:{' '}
                            {new Date(item.expired_at).toLocaleDateString(
                              'id-ID',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
                            isExpired
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isExpired ? 'Expired' : `${diffDays} hari lagi`}
                        </span>

                        <Link
                          to="/recommendations"
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold text-center hover:bg-green-700 transition"
                        >
                          Gunakan
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </UserLayout>
  );
}