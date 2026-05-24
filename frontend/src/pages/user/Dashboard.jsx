import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Bot,
  ChefHat,
  Plus,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../layouts/UserLayout';

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h2 className="text-4xl font-bold mt-3">{value}</h2>
        </div>

        <div className={`${bg} ${color} p-3 rounded-2xl`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/inventory');
        setItems(response.data.data || []);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchInventory();
  }, []);

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

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-green-100 font-medium">
              Smart Food Management
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Halo, {user?.name}
            </h1>

            <p className="text-green-50 mt-3 text-lg">
              Kamu memiliki {items.length} bahan di inventory,{' '}
              {soonExpiredItems.length} hampir expired, dan{' '}
              {expiredItems.length} sudah expired.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/inventory"
                className="inline-flex items-center gap-2 bg-white text-green-700 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition"
              >
                <Plus size={18} />
                Tambah Inventory
              </Link>

              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 bg-green-800/30 border border-white/30 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-800/40 transition"
              >
                <ChefHat size={18} />
                Lihat Rekomendasi AI
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            title="Total Bahan"
            value={items.length}
            icon={Package}
            color="text-blue-700"
            bg="bg-blue-100"
          />

          <StatCard
            title="Hampir Expired"
            value={soonExpiredItems.length}
            icon={AlertTriangle}
            color="text-yellow-700"
            bg="bg-yellow-100"
          />

          <StatCard
            title="Sudah Expired"
            value={expiredItems.length}
            icon={CheckCircle}
            color="text-red-700"
            bg="bg-red-100"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
              <Bot size={24} />
            </div>

            <div>
              <h2 className="font-bold text-lg">Insight AI Hari Ini</h2>

              {attentionItems.length > 0 ? (
                <p className="text-slate-600 mt-1">
                  Ada {attentionItems.length} bahan yang perlu segera
                  diperhatikan. Gunakan fitur rekomendasi AI untuk mencari ide
                  resep agar bahan tidak terbuang.
                </p>
              ) : items.length === 0 ? (
                <p className="text-slate-600 mt-1">
                  Inventory kamu masih kosong. Tambahkan bahan pertama agar AI
                  bisa membantu memberi rekomendasi resep.
                </p>
              ) : (
                <p className="text-slate-600 mt-1">
                  Semua bahan terlihat aman. Tetap pantau inventory secara rutin
                  agar bahan makanan tidak terbuang.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg">
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

              <p className="text-slate-500 mt-1">
                Tidak ada bahan yang perlu perhatian khusus hari ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attentionItems.map((item) => {
                const diffDays = getDiffDays(item.expired_at);
                const isExpired = diffDays < 0;

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
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
                          {isExpired
                            ? 'Expired'
                            : `${diffDays} hari lagi`}
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
                      className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center hover:bg-green-700 transition"
                    >
                      Gunakan Sekarang
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}