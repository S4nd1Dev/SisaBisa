import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  Bookmark,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';

function StatCard({ title, value, icon: Icon, color, bg, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6 hover:shadow-md transition"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>

          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            {value}
          </h2>
        </div>

        <div className={`${bg} ${color} p-3 rounded-2xl shrink-0`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_inventory: 0,
    total_favorites: 0,
    expired_items: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadStats = async () => {
      try {
        setLoading(true);

        const response = await api.get('/admin/stats');

        if (ignore) return;

        setStats(response.data.data);
      } catch {
        toast.error('Gagal memuat admin dashboard');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadStats();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl shadow p-6 md:p-8 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              <ShieldCheck size={28} />
            </div>

            <div>
              <p className="text-slate-300 font-medium">
                Admin Panel
              </p>

              <h1 className="text-2xl md:text-4xl font-bold mt-2">
                Dashboard Admin
              </h1>

              <p className="text-slate-300 mt-3 max-w-2xl">
                Pantau aktivitas pengguna, inventory, dan resep favorit
                pada aplikasi SisaBisa secara realtime.
              </p>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
              >
                <div className="h-4 bg-slate-100 rounded animate-pulse" />

                <div className="h-10 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total User"
              value={stats.total_users}
              icon={Users}
              color="text-blue-700"
              bg="bg-blue-100"
              index={0}
            />

            <StatCard
              title="Total Inventory"
              value={stats.total_inventory}
              icon={Package}
              color="text-green-700"
              bg="bg-green-100"
              index={1}
            />

            <StatCard
              title="Resep Favorit"
              value={stats.total_favorites}
              icon={Bookmark}
              color="text-purple-700"
              bg="bg-purple-100"
              index={2}
            />

            <StatCard
              title="Bahan Expired"
              value={stats.expired_items}
              icon={AlertTriangle}
              color="text-red-700"
              bg="bg-red-100"
              index={3}
            />
          </section>
        )}
      </div>
    </UserLayout>
  );
}