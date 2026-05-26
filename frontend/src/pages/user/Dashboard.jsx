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
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../layouts/UserLayout';

function StatCard({ title, value, icon: Icon, color, bg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 hover:shadow-md transition"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 md:mt-3">
            {value}
          </h2>
        </div>

        <div className={`${bg} ${color} p-3 rounded-2xl shrink-0`}>
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiredCount = inventoryData.filter((item) => {
          const expiredDate = new Date(item.expired_at);
          expiredDate.setHours(0, 0, 0, 0);
          return expiredDate < today;
        }).length;

        const soonCount = inventoryData.filter((item) => {
          const expiredDate = new Date(item.expired_at);
          expiredDate.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (expiredDate - today) / (1000 * 60 * 60 * 24)
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
      <div className="space-y-5 md:space-y-6">
        {attentionItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5 md:p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-yellow-100 text-yellow-700 p-3 rounded-2xl shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="font-bold text-yellow-900">
                    Ada bahan yang perlu segera digunakan
                  </h2>

                  <p className="text-yellow-800 text-sm md:text-base mt-1">
                    {expiredItems.length > 0 &&
                      `${expiredItems.length} bahan sudah expired. `}
                    {soonExpiredItems.length > 0 &&
                      `${soonExpiredItems.length} bahan hampir expired.`}
                  </p>
                </div>
              </div>

              <Link
                to="/recommendations"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-3 rounded-xl font-semibold text-center transition"
              >
                Cari Resep AI
              </Link>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-5 md:p-8 text-white"
        >
          <div className="max-w-3xl">
            <p className="text-green-100 font-medium text-sm md:text-base">
              Smart Food Management
            </p>

            <h1 className="text-2xl md:text-4xl font-bold mt-2 leading-tight">
              Halo, {user?.name}
            </h1>

            <p className="text-green-50 mt-3 text-sm md:text-lg leading-relaxed">
              Kamu memiliki {items.length} bahan di inventory,{' '}
              {soonExpiredItems.length} hampir expired,{' '}
              {expiredItems.length} sudah expired, dan {favoriteCount} resep
              favorit tersimpan.
            </p>

            <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/inventory"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
              >
                <Plus size={18} />
                Tambah Inventory
              </Link>

              <Link
                to="/recommendations"
                className="inline-flex items-center justify-center gap-2 bg-green-800/30 border border-white/30 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-800/40 transition"
              >
                <ChefHat size={18} />
                Rekomendasi AI
              </Link>

              <Link
                to="/favorites"
                className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/20 transition"
              >
                <Bookmark size={18} />
                Favorit
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
            color="text-yellow-700"
            bg="bg-yellow-100"
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

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="bg-green-100 text-green-700 p-3 rounded-2xl shrink-0">
              <Bot size={22} />
            </div>

            <div>
              <h2 className="font-bold text-base md:text-lg">
                Insight AI Hari Ini
              </h2>

              {attentionItems.length > 0 ? (
                <p className="text-slate-600 mt-1 text-sm md:text-base leading-relaxed">
                  Ada {attentionItems.length} bahan yang perlu segera
                  diperhatikan. Gunakan fitur rekomendasi AI untuk mencari ide
                  resep agar bahan tidak terbuang.
                </p>
              ) : items.length === 0 ? (
                <p className="text-slate-600 mt-1 text-sm md:text-base leading-relaxed">
                  Inventory kamu masih kosong. Tambahkan bahan pertama agar AI
                  bisa membantu memberi rekomendasi resep.
                </p>
              ) : favoriteCount > 0 ? (
                <p className="text-slate-600 mt-1 text-sm md:text-base leading-relaxed">
                  Semua bahan terlihat aman. Kamu juga sudah menyimpan{' '}
                  {favoriteCount} resep favorit yang bisa digunakan kembali.
                </p>
              ) : (
                <p className="text-slate-600 mt-1 text-sm md:text-base leading-relaxed">
                  Semua bahan terlihat aman. Tetap pantau inventory secara rutin
                  agar bahan makanan tidak terbuang.
                </p>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.24 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
            <div>
              <h2 className="font-bold text-base md:text-lg">
                Bahan yang Perlu Diperhatikan
              </h2>
              <p className="text-sm text-slate-500">
                Prioritaskan bahan yang sudah atau hampir expired.
              </p>
            </div>

            <Link
              to="/inventory"
              className="text-green-700 font-semibold text-sm hover:underline"
            >
              Lihat Inventory
            </Link>
          </div>

          {attentionItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="mx-auto bg-green-100 text-green-700 w-14 h-14 rounded-2xl flex items-center justify-center">
                <CheckCircle size={28} />
              </div>

              <h3 className="font-bold mt-4">Semua bahan masih aman</h3>

              <p className="text-slate-500 mt-1 text-sm md:text-base">
                Tidak ada bahan yang perlu perhatian khusus hari ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attentionItems.map((item, index) => {
                const diffDays = getDiffDays(item.expired_at);
                const isExpired = diffDays < 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">
                          {item.ingredient_name}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isExpired
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {isExpired ? 'Expired' : `${diffDays} hari lagi`}
                        </span>
                      </div>

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

                    <Link
                      to="/recommendations"
                      className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center hover:bg-green-700 transition"
                    >
                      Gunakan Sekarang
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </UserLayout>
  );
}