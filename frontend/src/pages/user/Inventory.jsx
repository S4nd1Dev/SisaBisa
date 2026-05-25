import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
        label: 'Expired',
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-700',
      };
    }

    if (diffDays <= 3) {
      return {
        label: `${diffDays} hari lagi`,
        icon: AlertTriangle,
        className: 'bg-yellow-100 text-yellow-700',
      };
    }

    return {
      label: 'Aman',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-700',
    };
  };

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

  return (
    <UserLayout>
      <div className="space-y-5 md:space-y-6">
        <section className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-5 md:p-8 text-white">
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

            <div className="bg-white/20 border border-white/30 rounded-2xl p-4 md:p-5 md:min-w-40">
              <p className="text-green-50 text-sm">Total Inventory</p>
              <h2 className="text-3xl md:text-4xl font-bold mt-1">
                {items.length}
              </h2>
              <p className="text-green-50 text-sm mt-1">
                bahan tersimpan
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6">
          <div className="flex items-start gap-3 mb-5 md:mb-6">
            <div className="bg-green-100 text-green-700 p-3 rounded-2xl shrink-0">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-bold text-lg md:text-xl">
                Tambah Bahan
              </h2>
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
                <div className="absolute z-20 bg-white border border-slate-200 rounded-xl shadow-lg w-full mt-2 max-h-56 overflow-y-auto">
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
                </div>
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

            <button className="md:col-span-2 bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-xl font-semibold">
              Tambah ke Inventory
            </button>
          </form>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6">
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
                  Pantau bahan yang tersimpan dan status kadaluarsanya.
                </p>
              </div>
            </div>

            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-sm font-semibold w-fit">
              {items.length} bahan
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const status = getExpiryStatus(item.expired_at);
              const StatusIcon = status.icon;

              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-sm transition"
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
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl font-semibold transition"
                  >
                    <Trash2 size={17} />
                    Hapus
                  </button>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="text-center py-12 md:py-14">
                <div className="mx-auto bg-slate-100 text-slate-500 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <Package size={30} />
                </div>

                <h3 className="font-bold mt-4">
                  Inventory masih kosong
                </h3>

                <p className="text-slate-500 mt-1 text-sm md:text-base">
                  Tambahkan bahan pertama agar sistem bisa membantu memantau
                  masa kadaluarsanya.
                </p>
              </div>
            )}
          </div>
        </section>

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