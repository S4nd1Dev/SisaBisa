import { useEffect, useState } from 'react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    quantity: '',
    unit: '',
    storage: '',
    purchase_date: '',
  });

  const fetchInventory = async () => {
    const response = await api.get('/inventory');
    setItems(response.data.data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getExpiryStatus = (expiredAt) => {
    const today = new Date();
    const expiredDate = new Date(expiredAt);

    today.setHours(0, 0, 0, 0);
    expiredDate.setHours(0, 0, 0, 0);

    const diffTime = expiredDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: 'Expired',
        className: 'bg-red-100 text-red-700',
      };
    }

    if (diffDays <= 3) {
      return {
        label: `${diffDays} hari lagi`,
        className: 'bg-yellow-100 text-yellow-700',
      };
    }

    return {
      label: 'Aman',
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

    const response = await api.get(`/public/ingredients?search=${value}`);
    setSuggestions(response.data.data);
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
    setMessage('');

    if (!selectedIngredient) {
      setMessage('Pilih bahan dari suggestion terlebih dahulu.');
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

      setMessage('Bahan berhasil ditambahkan.');

      fetchInventory();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Gagal menambah inventory'
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Yakin ingin menghapus bahan ini?'
    );

    if (!confirmDelete) return;

    await api.delete(`/inventory/${id}`);
    fetchInventory();
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold">
            Inventory Bahan
          </h1>

          <p className="text-slate-600 mt-1">
            Tambahkan bahan dan pantau masa kadaluarsanya.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold mb-4">
            Tambah Bahan
          </h2>

          <form
            onSubmit={handleAdd}
            className="grid md:grid-cols-2 gap-4"
          >
            <div className="relative md:col-span-2">
              <input
                value={search}
                onChange={(e) =>
                  handleSearch(e.target.value)
                }
                placeholder="Cari bahan, contoh: telur"
                className="w-full border rounded-lg px-4 py-2"
                required
              />

              {suggestions.length > 0 && (
                <div className="absolute z-10 bg-white border rounded-lg shadow w-full mt-1 max-h-48 overflow-y-auto">
                  {suggestions.map((item) => (
                    <button
                      type="button"
                      key={item.ingredient_id}
                      onClick={() =>
                        handleSelectIngredient(item)
                      }
                      className="w-full text-left px-4 py-2 hover:bg-slate-100"
                    >
                      <div className="font-medium">
                        {item.item}
                      </div>

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
              className="border rounded-lg px-4 py-2"
              required
            />

            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Satuan, contoh: butir"
              className="border rounded-lg px-4 py-2"
            />

            <select
              name="storage"
              value={form.storage}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2"
              required
            >
              <option value="">
                Pilih kondisi penyimpanan
              </option>

              <option value="suhu ruangan">
                Suhu Ruangan
              </option>

              <option value="kulkas">
                Kulkas
              </option>

              <option value="freezer">
                Freezer
              </option>
            </select>

            <input
              name="purchase_date"
              value={form.purchase_date}
              onChange={handleChange}
              type="date"
              className="border rounded-lg px-4 py-2"
              required
            />

            <button className="md:col-span-2 bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg font-semibold">
              Tambah Inventory
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-slate-700">
              {message}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">
              Daftar Inventory
            </h2>

            <span className="text-sm text-slate-500">
              {items.length} bahan
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const status = getExpiryStatus(
                item.expired_at
              );

              return (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition"
                >
                  <div>
                    <h3 className="font-bold">
                      {item.ingredient_name}
                    </h3>

                    <p className="text-sm text-slate-600">
                      {item.quantity} {item.unit}
                    </p>

                    <p className="text-sm text-slate-600">
                      Expired: {item.expired_at}
                    </p>

                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleDelete(item.id)
                    }
                    className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-lg"
                  >
                    Hapus
                  </button>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-500">
                  Belum ada bahan di inventory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}