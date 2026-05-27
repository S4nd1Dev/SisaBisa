import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  Bookmark,
  AlertTriangle,
  ShieldCheck,
  Mail,
  UserCheck,
  Search,
} from 'lucide-react';
import api from '../../api/axios';
import AdminLayout from '../../layouts/AdminLayout';

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
          <h2 className="text-3xl md:text-4xl font-bold mt-3">{value}</h2>
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

  const [usersOverview, setUsersOverview] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);

  const [search, setSearch] = useState('');
  const [expiredSearch, setExpiredSearch] = useState('');
  const [expiredFilter, setExpiredFilter] = useState('all');

  const [loading, setLoading] = useState(true);

  const filteredUsers = usersOverview.filter((user) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword);

    return matchesSearch;
  });

  const filteredExpiredItems = expiredItems.filter((item) => {
    const keyword = expiredSearch.toLowerCase();

    const matchesSearch =
      item.ingredient_name?.toLowerCase().includes(keyword) ||
      item.user_name?.toLowerCase().includes(keyword) ||
      item.user_email?.toLowerCase().includes(keyword);

    const expiredDate = new Date(item.expired_at);
    const today = new Date();

    expiredDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const isToday = expiredDate.getTime() === today.getTime();
    const isPast = expiredDate < today;

    const matchesFilter =
      expiredFilter === 'all' ||
      (expiredFilter === 'today' && isToday) ||
      (expiredFilter === 'past' && isPast);

    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    let ignore = false;

    const loadAdminData = async () => {
      try {
        setLoading(true);

        const [statsResponse, usersResponse, expiredResponse] =
          await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/users-overview'),
            api.get('/admin/expired-items'),
          ]);

        if (ignore) return;

        setStats(statsResponse.data.data);
        setUsersOverview(usersResponse.data.data || []);
        setExpiredItems(expiredResponse.data.data || []);
      } catch {
        toast.error('Gagal memuat admin dashboard');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadAdminData();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AdminLayout>
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
              <p className="text-slate-300 font-medium">Admin Panel</p>

              <h1 className="text-2xl md:text-4xl font-bold mt-2">
                Dashboard Admin
              </h1>

              <p className="text-slate-300 mt-3 max-w-2xl">
                Pantau aktivitas pengguna, inventory, dan resep favorit pada
                aplikasi SisaBisa secara realtime.
              </p>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <AdminSkeleton />
        ) : (
          <>
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

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.18 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-bold text-lg md:text-xl">
                    Monitoring Pengguna
                  </h2>

                  <p className="text-sm text-slate-500">
                    Menampilkan {filteredUsers.length} dari{' '}
                    {usersOverview.length} user.
                  </p>
                </div>

                <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold w-fit">
                  {filteredUsers.length} hasil
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-5">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau email user..."
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.04 }}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl shrink-0">
                        <UserCheck size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800">
                          {user.name}
                        </h3>

                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 break-all">
                          <Mail size={14} />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 lg:min-w-72">
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-500">Inventory</p>

                        <h4 className="text-xl font-bold mt-1">
                          {user.total_inventory}
                        </h4>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-xs text-slate-500">Favorit</p>

                        <h4 className="text-xl font-bold mt-1">
                          {user.total_favorites}
                        </h4>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-10">
                    <div className="mx-auto bg-slate-100 text-slate-500 w-14 h-14 rounded-2xl flex items-center justify-center">
                      <Users size={28} />
                    </div>

                    <h3 className="font-bold mt-4">
                      Tidak ada user yang cocok
                    </h3>

                    <p className="text-slate-500 mt-1">
                      Coba ubah kata pencarian user.
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.22 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-bold text-lg md:text-xl">
                    Monitoring Bahan Expired
                  </h2>

                  <p className="text-sm text-slate-500">
                    Menampilkan {filteredExpiredItems.length} dari{' '}
                    {expiredItems.length} bahan expired.
                  </p>
                </div>

                <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold w-fit">
                  {filteredExpiredItems.length} expired
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 mb-5">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={expiredSearch}
                    onChange={(e) => setExpiredSearch(e.target.value)}
                    placeholder="Cari bahan, nama user, atau email..."
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <select
                  value={expiredFilter}
                  onChange={(e) => setExpiredFilter(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Semua Expired</option>
                  <option value="today">Expired Hari Ini</option>
                  <option value="past">Sudah Lewat</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredExpiredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.03,
                    }}
                    className="border border-red-100 bg-red-50 rounded-2xl p-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={18}
                            className="text-red-600"
                          />

                          <h3 className="font-bold text-slate-800">
                            {item.ingredient_name}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-600 mt-2">
                          Pemilik:
                          <span className="font-semibold ml-1">
                            {item.user_name}
                          </span>
                        </p>

                        <p className="text-sm text-slate-500 break-all">
                          {item.user_email}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 lg:min-w-80">
                        <div className="bg-white rounded-2xl p-4 border border-red-100">
                          <p className="text-xs text-slate-500">Jumlah</p>

                          <h4 className="text-lg font-bold mt-1">
                            {item.quantity} {item.unit}
                          </h4>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-red-100">
                          <p className="text-xs text-slate-500">Expired</p>

                          <h4 className="text-sm font-bold mt-1 text-red-700">
                            {new Date(item.expired_at).toLocaleDateString(
                              'id-ID',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredExpiredItems.length === 0 && (
                  <div className="text-center py-10">
                    <div className="mx-auto bg-green-100 text-green-700 w-14 h-14 rounded-2xl flex items-center justify-center">
                      <ShieldCheck size={28} />
                    </div>

                    <h3 className="font-bold mt-4">
                      Tidak ada bahan expired yang cocok
                    </h3>

                    <p className="text-slate-500 mt-1">
                      Semua inventory user masih aman atau filter tidak
                      menemukan data.
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="h-5 bg-slate-100 rounded animate-pulse w-1/3" />

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-24 bg-slate-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}