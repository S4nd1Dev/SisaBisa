import { useState, useCallback } from 'react';
import {
  Bot,
  ChefHat,
  Clock,
  Sparkles,
  Search,
  AlertTriangle,
  Utensils,
} from 'lucide-react';
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
      label: 'Relevan',
      color: 'bg-blue-100 text-blue-700',
    };
  };

  const fetchExpiringItems = useCallback(async () => {
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
  }, []);

  const fetchAutoRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      setRecipes([]);

      await fetchExpiringItems();

      const response = await api.get('/recommendations');
      setRecipes(response.data.data.results || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'AI belum siap. Silakan coba lagi beberapa saat.'
      );
    } finally {
      setLoading(false);
    }
  }, [fetchExpiringItems]);

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
      setMessage('Isi bahan yang dimiliki dan bahan prioritas terlebih dahulu.');
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
        error.response?.data?.message ||
          'AI belum siap. Silakan coba lagi beberapa saat.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    setMessage('');
    setRecipes([]);
    setExpiringItems([]);
    setSelectedRecipe(null);
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
        error.response?.data?.message || 'Gagal mengambil detail resep.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-green-100 font-medium">AI Recipe Assistant</p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Temukan Resep dari Bahan yang Kamu Punya
            </h1>

            <p className="text-green-50 mt-3">
              Gunakan AI untuk mendapatkan ide resep dari bahan hampir expired
              atau dari bahan pilihanmu sendiri.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 grid md:grid-cols-2 gap-2">
          <button
            onClick={() => handleModeChange('auto')}
            className={`py-4 rounded-2xl font-semibold transition ${
              mode === 'auto'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dari Bahan Hampir Expired
          </button>

          <button
            onClick={() => handleModeChange('manual')}
            className={`py-4 rounded-2xl font-semibold transition ${
              mode === 'manual'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Input Bahan Sendiri
          </button>
        </div>

        {mode === 'auto' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="bg-green-100 text-green-700 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Bot size={24} />
                </div>

                <h2 className="font-bold text-xl mt-4">
                  Rekomendasi Otomatis
                </h2>

                <p className="text-slate-600 text-sm mt-2">
                  Sistem akan membaca inventory dan mencari bahan yang hampir
                  expired untuk diprioritaskan dalam resep.
                </p>

                <button
                  onClick={fetchAutoRecommendations}
                  disabled={loading}
                  className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-400"
                >
                  {loading ? 'AI sedang mencari...' : 'Cari Rekomendasi'}
                </button>
              </div>

              {expiringItems.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6">
                  <div className="flex items-center gap-2 text-yellow-800 font-bold">
                    <AlertTriangle size={20} />
                    Bahan Prioritas
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {expiringItems.map((item) => (
                      <span
                        key={item.id}
                        className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {item.ingredient_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <RecommendationResult
                recipes={recipes}
                loading={loading}
                message={message}
                detailLoading={detailLoading}
                getMatchLabel={getMatchLabel}
                onDetail={handleRecipeDetail}
              />
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Search size={24} />
                </div>

                <h2 className="font-bold text-xl mt-4">
                  Input Bahan Sendiri
                </h2>

                <p className="text-slate-600 text-sm mt-2">
                  Cocok untuk mencari ide resep dari bahan yang ingin kamu
                  gunakan hari ini.
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />

                    <p className="text-xs text-slate-500 mt-1">
                      Bahan ini akan diprioritaskan oleh AI.
                    </p>
                  </div>

                  <button
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-400"
                  >
                    {loading ? 'AI sedang mencari...' : 'Cari Resep'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <RecommendationResult
                recipes={recipes}
                loading={loading}
                message={message}
                detailLoading={detailLoading}
                getMatchLabel={getMatchLabel}
                onDetail={handleRecipeDetail}
              />
            </div>
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

function RecommendationResult({
  recipes,
  loading,
  message,
  detailLoading,
  getMatchLabel,
  onDetail,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
            <Sparkles size={24} />
          </div>

          <div>
            <h2 className="font-bold text-xl">AI sedang menganalisis...</h2>
            <p className="text-slate-500 mt-1">
              Menyesuaikan bahan dengan resep yang paling cocok.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6">
        {message}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
        <div className="mx-auto bg-slate-100 text-slate-500 w-16 h-16 rounded-2xl flex items-center justify-center">
          <Utensils size={30} />
        </div>

        <h2 className="font-bold text-xl mt-4">Belum ada rekomendasi</h2>

        <p className="text-slate-500 mt-2">
          Pilih mode rekomendasi, lalu klik tombol pencarian resep.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {recipes.map((recipe, index) => {
        const match = getMatchLabel(recipe.persentase_kecocokan);

        return (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition"
          >
            <div className="bg-green-100 text-green-700 w-12 h-12 rounded-2xl flex items-center justify-center">
              <ChefHat size={24} />
            </div>

            <h2 className="text-xl font-bold mt-4">{recipe.nama_menu}</h2>

            <p className="text-slate-600 mt-3 line-clamp-2">
              {recipe.bahan_resep}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${match.color}`}
              >
                {match.label}
              </span>

              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1">
                <Clock size={14} />
                Cepat dibuat
              </span>
            </div>

            <button
              onClick={() => onDetail(recipe)}
              disabled={detailLoading}
              className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-400"
            >
              {detailLoading ? 'Memuat Detail...' : 'Lihat Detail Resep'}
            </button>
          </div>
        );
      })}
    </div>
  );
}