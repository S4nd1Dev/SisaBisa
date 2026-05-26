import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import {
  Search,
  Plus,
  Package,
  Trash2,
  CalendarDays,
  Refrigerator,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    quantity: '',
    unit: '',
    storage: '',
    purchase_date: '',
  });

  const fetchInventory = async () => {
    const response = await api.get('/inventory');
    return response.data.data || [];
  };

  useEffect(() => {
    let ignore = false;

    const loadInventory = async () => {
      try {
        const data = await fetchInventory();
        if (!ignore) setItems(data);
      } catch {
        toast.error('Gagal memuat inventory');
      }
    };

    loadInventory();

    return () => {
      ignore = true;
    };
  }, []);

  const getExpiryStatus = (expiredAt) => {
    const today = new Date();
    const expiredDate = new Date(expiredAt);

    today.setHours(0, 0, 0, 0);
    expiredDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (expiredDate - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return {
        key: 'expired',
        label: 'Expired',
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-700',
      };
    }

    if (diffDays <= 3) {
      return {
        key: 'soon',
        label: `${diffDays} hari lagi`,
        icon: AlertTriangle,
        className: 'bg-yellow-100 text-yellow-700',
      };
    }

    return {
      key: 'safe',
      label: 'Aman',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700',
    };
  };

  const filteredItems = items.filter((item) => {
    const status = getExpiryStatus(item.expired_at);

    const matchesSearch = item.ingredient_name
      .toLowerCase()
      .includes(inventorySearch.toLowerCase());

    const matchesFilter = filter === 'all' || status.key === filter;

    return matchesSearch && matchesFilter;
  });

  const handleSearch = async (value) => {
    setSearch(value);
    setSelectedIngredient(null);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await api.get(`/public/ingredients?search=${value}`);
      setSuggestions(response.data.data || []);
    } catch {
      toast.error('Gagal mencari bahan');
    }
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.item);
    setSuggestions([]);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!selectedIngredient) {
      toast.error('Pilih bahan dari suggestion terlebih dahulu');
      return;
    }

    try {
      const expiryResponse = await api.post('/public/check-expiry', {
        ingredient_id: selectedIngredient.ingredient_id,
        storage: form.storage,
        purchase_date: form.purchase_date,
      });

      const expiryData = expiryResponse.data.data;

      await api.post('/inventory', {
        ingredient_name: expiryData.item,
        quantity: form.quantity,
        unit: form.unit,
        expired_at: expiryData.estimated_expired_at,
      });

      setSearch('');
      setSelectedIngredient(null);
      setForm({
        quantity: '',
        unit: '',
        storage: '',
        purchase_date: '',
      });

      toast.success('Bahan berhasil ditambahkan');

      const data = await fetchInventory();
      setItems(data);
    } catch {
      toast.error('Gagal menambah inventory');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/inventory/${deleteTarget.id}`);
      toast.success('Bahan berhasil dihapus');

      const data = await fetchInventory();
      setItems(data);
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus bahan');
    }
  };

  const filterOptions = [
    { label: 'Semua', value: 'all' },
    { label: 'Aman', value: 'safe' },
    { label: 'Hampir Expired', value: 'soon' },
    { label: 'Expired', value: 'expired' },
  ];

  return (
    <UserLayout>
      <div className="space-y-5 md:space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-5 md:p-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
            <div>
              <p className="text-green-100 font-medium text-sm md:text-base">
                Inventory Management
              </p>

              <h1 className="text-2xl md:text-4xl font-bold mt-2 leading-tight">
                Kelola Bahan Makanan
              </h1>

              <p className="text-green-50 mt-3 max-w-2xl text-sm md:text-base leading-relaxed">
                Tambahkan bahan makanan, pilih kondisi penyimpanan, dan sistem
                akan menghitung estimasi tanggal kadaluarsa secara otomatis.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white/20 border border-white/30 rounded-2xl p-4 md:p-5 md:min-w-40"
            >
              <p className="text-green-50 text-sm">Total Inventory</p>
              <h2 className="text-3xl md:text-4xl font-bold mt-1">
                {items.length}
              </h2>
              <p className="text-green-50 text-sm mt-1">
                bahan tersimpan
              </p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6"
        >
          <div className="flex items-start gap-3 mb-5 md:mb-6">
            <div className="bg-green-100 text-green-700 p-3 rounded-2xl shrink-0">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-lg md:text-xl">Tambah Bahan</h2>
              <p className="text-sm text-slate-500">
                Cari bahan dari dataset lalu masukkan jumlah dan tanggal beli.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="relative md:col-span-2">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari bahan, contoh: telur"
                className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />

              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 bg-white border border-slate-200 rounded-xl shadow-lg w-full mt-2 max-h-56 overflow-y-auto"
                >
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={item.ingredient_id}
                      onClick={() => handleSelectIngredient(item)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 transition"
                    >
                      <div className="font-semibold">{item.item}</div>
                      <div className="text-sm text-slate-500">
                        {item.category}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <input
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Jumlah"
              type="number"
              className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Satuan, contoh: butir"
              className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              name="storage"
              value={form.storage}
              onChange={handleChange}
              className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Pilih kondisi penyimpanan</option>
              <option value="suhu ruangan">Suhu Ruangan</option>
              <option value="kulkas">Kulkas</option>
              <option value="freezer">Freezer</option>
            </select>

            <input
              name="purchase_date"
              value={form.purchase_date}
              onChange={handleChange}
              type="date"
              className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            <button className="md:col-span-2 bg-green-600 hover:bg-green-700 active:scale-[0.99] transition text-white py-3 rounded-xl font-semibold">
              Tambah ke Inventory
            </button>
          </form>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.14 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl shrink-0">
                <Package size={22} />
              </div>

              <div>
                <h2 className="font-bold text-lg md:text-xl">
                  Daftar Inventory
                </h2>
                <p className="text-sm text-slate-500">
                  Menampilkan {filteredItems.length} dari {items.length} bahan.
                </p>
              </div>
            </div>

            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold w-fit">
              {filteredItems.length} hasil
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 mb-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Cari inventory..."
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredItems.map((item, index) => {
              const status = getExpiryStatus(item.expired_at);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-sm transition bg-white"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl shrink-0">
                      <Refrigerator size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-base md:text-lg break-words">
                        {item.ingredient_name}
                      </h3>

                      <p className="text-sm text-slate-600 mt-1">
                        {item.quantity} {item.unit}
                      </p>

                      <div className="flex items-start gap-2 text-sm text-slate-500 mt-2">
                        <CalendarDays size={16} className="shrink-0 mt-0.5" />
                        <span>
                          Expired:{' '}
                          {new Date(item.expired_at).toLocaleDateString(
                            'id-ID',
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-sm font-semibold ${status.className}`}
                      >
                        <StatusIcon size={15} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-700 px-4 py-2 rounded-xl font-semibold transition"
                  >
                    <Trash2 size={17} />
                    Hapus
                  </button>
                </motion.div>
              );
            })}

            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 md:py-14"
              >
                <div className="mx-auto bg-slate-100 text-slate-500 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <Package size={30} />
                </div>

                <h3 className="font-bold mt-4">
                  Tidak ada inventory yang cocok
                </h3>

                <p className="text-slate-500 mt-1 text-sm md:text-base">
                  Coba ubah kata pencarian atau filter yang digunakan.
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {deleteTarget && (
          <DeleteConfirmModal
            itemName={deleteTarget.ingredient_name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </UserLayout>
  );
}