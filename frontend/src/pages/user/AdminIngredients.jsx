import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  PackageSearch,
  Leaf,
  X,
} from 'lucide-react';
import {
  getAdminIngredients,
  createIngredient,
  updateIngredient,
  updateIngredientStatus,
} from '../../services/ingredientService';

const defaultStorageRules = [
  { storage: 'Suhu Ruangan', days: '' },
  { storage: 'Kulkas', days: '' },
  { storage: 'Freezer', days: '' },
];

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [search, setSearch] = useState('');
  const [editingIngredient, setEditingIngredient] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    storage_rules: defaultStorageRules,
  });

  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    storage_rules: defaultStorageRules,
  });

  const fetchIngredients = async (keyword) => {
    if (!keyword.trim()) {
      setIngredients([]);
      setHasSearched(false);
      return;
    }

    const result = await getAdminIngredients(keyword);
    setIngredients(result.data || []);
    setHasSearched(true);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    await fetchIngredients(value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        storage_rules: form.storage_rules.map((rule) => ({
          ...rule,
          days: Number(rule.days),
        })),
      };

      const result = await createIngredient(payload);

      if (result.status === 'success') {
        toast.success('Bahan berhasil ditambahkan');

        setForm({
          name: '',
          category: '',
          storage_rules: defaultStorageRules,
        });

        if (search.trim()) {
          await fetchIngredients(search);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal menambahkan bahan');
    }
  };

  const handleEditOpen = (item) => {
    setEditingIngredient(item);

    setEditForm({
      name: item.name || '',
      category: item.category || '',
      storage_rules:
        item.storage_rules?.map((rule) => ({
          storage: rule.storage,
          days: rule.days,
        })) || defaultStorageRules,
    });
  };

  const handleEditClose = () => {
    setEditingIngredient(null);
    setEditForm({
      name: '',
      category: '',
      storage_rules: defaultStorageRules,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!editingIngredient) return;

      const payload = {
        ...editForm,
        storage_rules: editForm.storage_rules.map((rule) => ({
          ...rule,
          days: Number(rule.days),
        })),
      };

      const result = await updateIngredient(editingIngredient.id, payload);

      if (result.status === 'success') {
        toast.success('Bahan berhasil diperbarui');
        handleEditClose();

        if (search.trim()) {
          await fetchIngredients(search);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memperbarui bahan');
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    try {
      await updateIngredientStatus(id, !currentStatus);

      toast.success(
        currentStatus
          ? 'Bahan berhasil diarsipkan'
          : 'Bahan berhasil dipulihkan'
      );

      if (search.trim()) {
        await fetchIngredients(search);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah status bahan');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 md:p-8 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-slate-100">
              <Leaf size={16} />
              Master Data
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-bold">
              Ingredient Management
            </h1>

            <p className="mt-3 max-w-2xl text-slate-200">
              Kelola data bahan, kategori, dan aturan penyimpanan yang langsung
              digunakan oleh fitur inventory user.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/10 p-4 min-w-44">
            <p className="text-sm text-slate-200">Hasil pencarian</p>
            <p className="mt-1 text-3xl font-bold">{ingredients.length}</p>
            <p className="text-sm text-slate-300">bahan ditemukan</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="rounded-2xl bg-green-100 text-green-700 p-3">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Tambah Bahan
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Tambahkan bahan baru agar bisa dipilih user.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Nama bahan
              </label>
              <input
                type="text"
                placeholder="Contoh: Telur"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Kategori
              </label>
              <input
                type="text"
                placeholder="Contoh: Produk Susu & Telur"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-4">
              <p className="text-sm font-bold text-slate-700">
                Aturan penyimpanan
              </p>

              {form.storage_rules.map((rule, index) => (
                <div key={rule.storage}>
                  <label className="text-sm font-medium text-slate-600">
                    {rule.storage}
                  </label>

                  <input
                    type="number"
                    placeholder="Jumlah hari"
                    value={rule.days}
                    onChange={(e) => {
                      const updated = form.storage_rules.map((item, i) =>
                        i === index
                          ? { ...item, days: e.target.value }
                          : item
                      );

                      setForm({
                        ...form,
                        storage_rules: updated,
                      });
                    }}
                    className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.99] transition text-white rounded-2xl py-3 font-bold"
            >
              Simpan Bahan
            </button>
          </form>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 md:p-6 h-[720px] flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <PackageSearch className="text-slate-700" size={22} />
                <h2 className="text-xl font-bold text-slate-800">
                  Daftar Bahan
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-1">
                {hasSearched
                  ? `Total ${ingredients.length} bahan ditemukan`
                  : 'Cari bahan untuk menampilkan data'}
              </p>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Cari nama/kategori bahan..."
                value={search}
                onChange={handleSearchChange}
                className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="overflow-auto flex-1 rounded-2xl border border-slate-100">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="px-5 py-4 font-bold">Nama Bahan</th>
                  <th className="px-5 py-4 font-bold">Kategori</th>
                  <th className="px-5 py-4 font-bold">Storage Rules</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!hasSearched ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Search size={28} />
                      </div>
                      <p className="mt-4 font-bold text-slate-700">
                        Mulai cari bahan
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Data tidak ditampilkan sebelum admin melakukan pencarian.
                      </p>
                    </td>
                  </tr>
                ) : ingredients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                        <PackageSearch size={28} />
                      </div>
                      <p className="mt-4 font-bold text-slate-700">
                        Bahan tidak ditemukan
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Coba gunakan kata kunci lain.
                      </p>
                    </td>
                  </tr>
                ) : (
                  ingredients.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition ${
                        item.is_active
                          ? 'hover:bg-slate-50'
                          : 'bg-slate-50/80'
                      }`}
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold text-slate-800 capitalize">
                          {item.name}
                        </p>

                        {!item.is_active && (
                          <p className="text-xs text-slate-400 mt-1">
                            Tidak tampil di halaman user
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2 max-w-md">
                          {item.storage_rules?.map((rule) => (
                            <span
                              key={`${item.id}-${rule.storage}`}
                              className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                            >
                              {rule.storage}: {rule.days} hari
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            item.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.is_active ? 'Aktif' : 'Diarsipkan'}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditOpen(item)}
                            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(item.id, item.is_active)
                            }
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                              item.is_active
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {item.is_active ? (
                              <>
                                <Archive size={14} />
                                Arsipkan
                              </>
                            ) : (
                              <>
                                <RotateCcw size={14} />
                                Pulihkan
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editingIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-5 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Edit Bahan
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Perubahan akan langsung digunakan oleh fitur user.
                </p>
              </div>

              <button
                type="button"
                onClick={handleEditClose}
                className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Nama bahan
                </label>
                <input
                  type="text"
                  placeholder="Nama bahan"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Kategori
                </label>
                <input
                  type="text"
                  placeholder="Kategori"
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-4">
                <p className="text-sm font-bold text-slate-700">
                  Aturan penyimpanan
                </p>

                {editForm.storage_rules.map((rule, index) => (
                  <div key={rule.storage}>
                    <label className="text-sm font-medium text-slate-600">
                      {rule.storage}
                    </label>

                    <input
                      type="number"
                      placeholder="Jumlah hari"
                      value={rule.days}
                      onChange={(e) => {
                        const updated = editForm.storage_rules.map((item, i) =>
                          i === index
                            ? { ...item, days: e.target.value }
                            : item
                        );

                        setEditForm({
                          ...editForm,
                          storage_rules: updated,
                        });
                      }}
                      className="mt-1 w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-3 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}