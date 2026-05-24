import { useEffect, useState } from 'react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';
import RecipeDetailModal from '../../components/RecipeDetailModal';

export default function Recommendations() {
  const [mode, setMode] = useState('auto');

  const [recipes, setRecipes] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [manualForm, setManualForm] = useState({
    bahan_user: '',
    bahan_mau_basi: '',
  });

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getMatchLabel = (score) => {
    const numericScore = parseInt(score);

    if (numericScore >= 80) {
      return {
        label: 'Sangat Cocok',
        color: 'bg-green-100 text-green-700',
      };
    }

    if (numericScore >= 50) {
      return {
        label: 'Cocok',
        color: 'bg-yellow-100 text-yellow-700',
      };
    }

    return {
      label: 'Kurang Cocok',
      color: 'bg-red-100 text-red-700',
    };
  };

  useEffect(() => {
    fetchAutoRecommendations();
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    try {
      const response = await api.get('/inventory');
      const items = response.data.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filtered = items.filter((item) => {
        const expiredDate = new Date(item.expired_at);
        expiredDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil(
          (expiredDate - today) / (1000 * 60 * 60 * 24)
        );

        return diffDays >= 0 && diffDays <= 3;
      });

      setExpiringItems(filtered);
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchAutoRecommendations = async () => {
    try {
      setLoading(true);
      setMessage('');
      setRecipes([]);

      const response = await api.get('/recommendations');

      setRecipes(response.data.data.results || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Gagal mengambil rekomendasi otomatis'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualChange = (e) => {
    setManualForm({
      ...manualForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleManualRecommendation = async (e) => {
    e.preventDefault();
    setMessage('');
    setRecipes([]);

    if (!manualForm.bahan_user.trim() || !manualForm.bahan_mau_basi.trim()) {
      setMessage('Bahan yang dimiliki dan bahan prioritas wajib diisi.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/recommendations/manual', {
        bahan_user: manualForm.bahan_user,
        bahan_mau_basi: manualForm.bahan_mau_basi,
      });

      setRecipes(response.data.data.results || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Gagal mengambil rekomendasi manual'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    setMessage('');
    setRecipes([]);
    setSelectedRecipe(null);

    if (selectedMode === 'auto') {
      fetchAutoRecommendations();
      fetchExpiringItems();
    }
  };

  const handleRecipeDetail = async (recipe) => {
    try {
      setDetailLoading(true);
      setMessage('');

      const response = await api.post('/recommendations/detail', {
        nama_menu: recipe.nama_menu,
        bahan_resep: recipe.bahan_resep,
      });

      setSelectedRecipe(response.data.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Gagal mengambil detail resep'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold">Rekomendasi Resep AI</h1>

          <p className="text-slate-600 mt-1">
            Pilih rekomendasi otomatis dari bahan hampir expired atau masukkan
            bahan sendiri untuk mendapatkan ide resep.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-2 flex gap-2">
          <button
            onClick={() => handleModeChange('auto')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              mode === 'auto'
                ? 'bg-green-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dari Bahan Hampir Expired
          </button>

          <button
            onClick={() => handleModeChange('manual')}
            className={`flex-1 py-3 rounded-xl font-semibold transition ${
              mode === 'manual'
                ? 'bg-green-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Input Bahan Sendiri
          </button>
        </div>

        {mode === 'auto' && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="text-green-800 font-semibold">
                🤖 AI sedang membantu memilih resep terbaik dari inventory kamu.
              </p>
              <p className="text-sm text-slate-600 mt-1">
                Rekomendasi diprioritaskan dari bahan yang masa kadaluarsanya
                paling dekat.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-bold mb-4">
                Bahan yang Perlu Segera Digunakan
              </h2>

              {expiringItems.length === 0 ? (
                <p className="text-slate-500">
                  Belum ada bahan yang hampir expired dalam 3 hari ke depan.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {expiringItems.map((item) => (
                    <span
                      key={item.id}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {item.ingredient_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'manual' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg">Input Bahan Sendiri</h2>

            <p className="text-slate-600 text-sm mt-1">
              Masukkan bahan yang ingin kamu gunakan, lalu tentukan bahan utama
              atau bahan prioritas.
            </p>

            <form
              onSubmit={handleManualRecommendation}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bahan yang Dimiliki
                </label>

                <textarea
                  name="bahan_user"
                  value={manualForm.bahan_user}
                  onChange={handleManualChange}
                  placeholder="Contoh: telur ayam, bawang merah, cabai, nasi, garam"
                  className="w-full border rounded-xl px-4 py-3 min-h-28"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bahan Prioritas
                </label>

                <input
                  name="bahan_mau_basi"
                  value={manualForm.bahan_mau_basi}
                  onChange={handleManualChange}
                  placeholder="Contoh: telur ayam"
                  className="w-full border rounded-xl px-4 py-3"
                  required
                />

                <p className="text-xs text-slate-500 mt-1">
                  Bahan ini akan diprioritaskan oleh AI dalam rekomendasi resep.
                </p>
              </div>

              <button
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-slate-400"
              >
                {loading ? 'AI sedang mencari resep...' : 'Cari Rekomendasi'}
              </button>
            </form>
          </div>
        )}

        {message && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            {message}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p>AI sedang menganalisis bahan makananmu...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">
              Belum ada rekomendasi resep yang tersedia.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recipes.map((recipe, index) => {
              const match = getMatchLabel(recipe.persentase_kecocokan);

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow p-6"
                >
                  <h2 className="text-xl font-bold">
                    {recipe.nama_menu}
                  </h2>

                  <p className="text-slate-600 mt-3">
                    {recipe.bahan_resep}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${match.color}`}
                    >
                      {match.label}
                    </span>

                    <button
                      onClick={() => handleRecipeDetail(recipe)}
                      disabled={detailLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:bg-slate-400"
                    >
                      {detailLoading ? 'Memuat...' : 'Detail'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </div>
    </UserLayout>
  );
}