import { useState } from 'react';
import api from '../../api/axios';

export default function ExpiryChecker() {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [storage, setStorage] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleSearch = async (value) => {
    setSearch(value);
    setSelectedIngredient(null);
    setResult(null);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await api.get(`/public/ingredients?search=${value}`);
      setSuggestions(response.data.data);
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.item);
    setSuggestions([]);
  };

  const handleCheckExpiry = async (e) => {
    e.preventDefault();
    setMessage('');
    setResult(null);

    if (!selectedIngredient || !storage || !purchaseDate) {
      setMessage('Pilih bahan, storage, dan tanggal beli terlebih dahulu.');
      return;
    }

    try {
      const response = await api.post('/public/check-expiry', {
        ingredient_id: selectedIngredient.ingredient_id,
        storage,
        purchase_date: purchaseDate,
      });

      setResult(response.data.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Gagal mengecek expired bahan.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Cek Estimasi Kadaluarsa
        </h1>

        <p className="text-slate-600 mt-2">
          Masukkan nama bahan untuk melihat estimasi tanggal kadaluarsa.
        </p>

        <form onSubmit={handleCheckExpiry} className="mt-6 space-y-4">
          <div className="relative">
            <label className="block mb-1 font-medium text-slate-700">
              Nama Bahan
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Contoh: telur"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring"
            />

            {suggestions.length > 0 && (
              <div className="absolute z-10 bg-white border rounded-lg shadow w-full mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.ingredient_id}
                    onClick={() => handleSelectIngredient(item)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100"
                  >
                    <div className="font-medium">{item.item}</div>
                    <div className="text-sm text-slate-500">{item.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-700">
                Tempat Penyimpanan
            </label>

            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring"
            >
              <option value="">Pilih storage</option>
              <option value="suhu ruangan">Ruangan Tanpa Pendingin</option>
              <option value="kulkas">Kulkas</option>
              <option value="freezer">Freezer</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-700">
              Tanggal Beli
            </label>

            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Cek Kadaluarsa
          </button>
        </form>

        {message && (
          <div className="mt-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <h2 className="font-bold text-green-800">Hasil Estimasi</h2>

            <div className="mt-2 text-slate-700 space-y-1">
              <p>Bahan: {result.item}</p>
              <p>Kategori: {result.category}</p>
              <p>Storage: {result.storage}</p>
              <p>Umur simpan: {result.shelf_life_days} hari</p>
              <p>
                Estimasi expired:{' '}
                <span className="font-bold">
                  {result.estimated_expired_at}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}