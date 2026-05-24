import { useState, useCallback } from 'react';
import {
  Bot,
  ChefHat,
  Clock,
  Sparkles,
  Search,
  AlertTriangle,
  Utensils,
  Wand2,
  ClipboardList,
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

      const filtered = items
        .map((item) => {
          const expiredDate = new Date(item.expired_at);
          expiredDate.setHours(0, 0, 0, 0);

          const diffDays = Math.ceil(
            (expiredDate - today) / (1000 * 60 * 60 * 24)
          );

          return {
            ...item,
            diffDays,
          };
        })
        .filter((item) => item.diffDays >= 0 && item.diffDays <= 3);

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
          'AI sedang disiapkan. Silakan coba lagi beberapa saat.'
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
      setMessage('Isi daftar bahan dan bahan utama terlebih dahulu.');
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
          'AI sedang disiapkan. Silakan coba lagi beberapa saat.'
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

  const useExample = () => {
    setManualForm({
      bahan_user: 'telur ayam, bawang merah, cabai, nasi, garam',
      bahan_mau_basi: 'telur ayam',
    });
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <section className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-8 text-white">
          <div className="max-w-3xl">
            <p className="text-green-100 font-semibold flex items-center gap-2">
              <Sparkles size={18} />
              AI Recipe Assistant
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
              Cari Resep dari Bahan yang Kamu Punya
            </h1>

            <p className="text-green-50 mt-3 text-lg">
              Pilih bahan hampir expired dari inventory atau masukkan bahan
              sendiri. AI akan membantu memberi ide resep yang mudah diikuti.
            </p>
          </div>
        </section>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 grid md:grid-cols-2 gap-2">
          <button
            onClick={() => handleModeChange('auto')}
            className={`py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 ${
              mode === 'auto'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot size={20} />
            Dari Inventory
          </button>

          <button
            onClick={() => handleModeChange('manual')}
            className={`py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 ${
              mode === 'manual'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search size={20} />
            Input Bahan Sendiri
          </button>
        </div>

        {mode === 'auto' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="bg-green-100 text-green-700 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Bot size={24} />
                </div>

                <h2 className="font-bold text-xl mt-4">
                  Rekomendasi Otomatis
                </h2>

                <p className="text-slate-600 text-sm mt-2">
                  Cocok saat kamu ingin memakai bahan yang mendekati expired
                  tanpa perlu mengetik manual.
                </p>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex gap-3">
                    <span className="bg-green-100 text-green-700 w-7 h-7 rounded-full flex items-center justify-center font-bold">
                      1
                    </span>
                    Sistem membaca inventory kamu.
                  </div>

                  <div className="flex gap-3">
                    <span className="bg-green-100 text-green-700 w-7 h-7 rounded-full flex items-center justify-center font-bold">
                      2
                    </span>
                    AI mencari resep dari bahan prioritas.
                  </div>
                </div>

                <button
                  onClick={fetchAutoRecommendations}
                  disabled={loading}
                  className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-400"
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

                  <p className="text-sm text-yellow-800 mt-2">
                    Bahan ini akan diprioritaskan oleh AI.
                  </p>

                  <div className="space-y-2 mt-4">
                    {expiringItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-yellow-100 rounded-2xl px-4 py-3"
                      >
                        <p className="font-semibold text-slate-800">
                          {item.ingredient_name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {item.diffDays === 0
                            ? 'Expired hari ini'
                            : `${item.diffDays} hari lagi`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <main className="lg:col-span-2">
              <RecommendationResult
                recipes={recipes}
                loading={loading}
                message={message}
                detailLoading={detailLoading}
                getMatchLabel={getMatchLabel}
                onDetail={handleRecipeDetail}
              />
            </main>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Search size={24} />
                </div>

                <h2 className="font-bold text-xl mt-4">Input Bahan Sendiri</h2>

                <p className="text-slate-600 text-sm mt-2">
                  Masukkan bahan yang tersedia di rumah. Gunakan tanda koma agar
                  AI lebih mudah membacanya.
                </p>

                <button
                  type="button"
                  onClick={useExample}
                  className="mt-4 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold"
                >
                  Gunakan contoh
                </button>

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
                      Bahan Utama / Prioritas
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
                      Pilih bahan yang paling ingin digunakan.
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
            </aside>

            <main className="lg:col-span-2">
              <RecommendationResult
                recipes={recipes}
                loading={loading}
                message={message}
                detailLoading={detailLoading}
                getMatchLabel={getMatchLabel}
                onDetail={handleRecipeDetail}
              />
            </main>
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
        <div className="flex items-start gap-4">
          <div className="bg-green-100 text-green-700 p-3 rounded-2xl animate-pulse">
            <Wand2 size={24} />
          </div>

          <div>
            <h2 className="font-bold text-xl">AI sedang menyusun resep...</h2>
            <p className="text-slate-500 mt-1">
              Tunggu sebentar, AI sedang mencocokkan bahan dengan resep yang
              paling sesuai.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="border border-slate-100 rounded-2xl p-5 space-y-3"
            >
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6">
        <p className="font-semibold">Rekomendasi belum bisa ditampilkan</p>
        <p className="text-sm mt-1">{message}</p>
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

        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Pilih mode rekomendasi, lalu klik tombol pencarian resep. Hasil resep
          akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-100 text-green-700 p-2 rounded-xl">
          <ClipboardList size={20} />
        </div>

        <div>
          <h2 className="font-bold text-xl">Hasil Rekomendasi</h2>
          <p className="text-sm text-slate-500">
            Pilih salah satu resep untuk melihat langkah memasaknya.
          </p>
        </div>
      </div>

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

              <p className="text-slate-600 mt-3 text-sm">
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
                  Mudah diikuti
                </span>
              </div>

              <button
                onClick={() => onDetail(recipe)}
                disabled={detailLoading}
                className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-400"
              >
                {detailLoading ? 'Memuat Detail...' : 'Lihat Cara Memasak'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}