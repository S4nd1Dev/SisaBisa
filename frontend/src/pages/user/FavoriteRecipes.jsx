import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Trash2,
  Clock,
  BarChart3,
  ChefHat,
  HeartPulse,
  Package,
  Eye,
} from 'lucide-react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import RecipeDetailModal from '../../components/RecipeDetailModal';

export default function FavoriteRecipes() {
  const [favorites, setFavorites] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchFavorites = async () => {
    const response = await api.get('/favorites');
    return response.data.data || [];
  };

  useEffect(() => {
    let ignore = false;

    const loadFavorites = async () => {
      try {
        const data = await fetchFavorites();
        if (!ignore) setFavorites(data);
      } catch {
        toast.error('Gagal memuat resep favorit');
      }
    };

    loadFavorites();

    return () => {
      ignore = true;
    };
  }, []);

  const mapFavoriteToRecipe = (recipe) => {
    return {
      nama_menu: recipe.recipe_name,
      bahan_resep: recipe.ingredients,
      langkah_memasak: recipe.cooking_steps || [],
      nutrisi: recipe.nutrition || {},
      waktu_masak: recipe.cooking_time,
      tingkat_kesulitan: recipe.difficulty,
      insight_kesehatan: recipe.health_insight,
    };
  };

  const handleOpenDetail = (recipe) => {
    setSelectedRecipe(mapFavoriteToRecipe(recipe));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/favorites/${deleteTarget.id}`);
      toast.success('Resep favorit berhasil dihapus');

      const data = await fetchFavorites();
      setFavorites(data);
      setDeleteTarget(null);
    } catch {
      toast.error('Gagal menghapus resep favorit');
    }
  };

  return (
    <UserLayout>
      <div className="space-y-5 md:space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl shadow p-5 md:p-8 text-white"
        >
          <p className="text-green-100 font-medium text-sm md:text-base flex items-center gap-2">
            <Bookmark size={18} />
            Favorite Recipes
          </p>

          <h1 className="text-2xl md:text-4xl font-bold mt-2 leading-tight">
            Resep yang Disimpan
          </h1>

          <p className="text-green-50 mt-3 max-w-2xl text-sm md:text-base leading-relaxed">
            Lihat kembali resep AI yang sudah kamu simpan untuk dimasak nanti.
          </p>
        </motion.section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6"
            >
              <button
                type="button"
                onClick={() => handleOpenDetail(recipe)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-700 p-3 rounded-2xl shrink-0">
                    <ChefHat size={22} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-lg md:text-xl leading-tight">
                      {recipe.recipe_name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Disimpan pada{' '}
                      {new Date(recipe.created_at).toLocaleDateString(
                        'id-ID',
                        {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                  {recipe.ingredients}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <InfoBadge
                    icon={Clock}
                    title="Waktu"
                    value={recipe.cooking_time || '-'}
                  />

                  <InfoBadge
                    icon={BarChart3}
                    title="Kesulitan"
                    value={recipe.difficulty || '-'}
                  />
                </div>

                {recipe.health_insight && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <HeartPulse
                        size={20}
                        className="text-blue-700 shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {recipe.health_insight}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 inline-flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <Eye size={16} />
                  Lihat detail resep
                </div>
              </button>

              <button
                onClick={() => setDeleteTarget(recipe)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-xl font-semibold transition"
              >
                <Trash2 size={17} />
                Hapus dari Favorit
              </button>
            </motion.div>
          ))}
        </section>

        {favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center"
          >
            <div className="mx-auto bg-slate-100 text-slate-500 w-16 h-16 rounded-2xl flex items-center justify-center">
              <Package size={30} />
            </div>

            <h2 className="font-bold text-xl mt-4">
              Belum ada resep favorit
            </h2>

            <p className="text-slate-500 mt-2">
              Simpan resep dari halaman rekomendasi agar bisa dibuka kembali di
              sini.
            </p>
          </motion.div>
        )}

        {deleteTarget && (
          <DeleteConfirmModal
            itemName={deleteTarget.recipe_name}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
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

function InfoBadge({ icon: Icon, title, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
      <div className="bg-slate-100 text-slate-600 p-2 rounded-xl">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}