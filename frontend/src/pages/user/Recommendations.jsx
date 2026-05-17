import { useEffect, useState } from 'react';
import api from '../../api/axios';
import UserLayout from '../../layouts/UserLayout';

export default function Recommendations() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await api.get('/recommendations');

      setRecipes(response.data.data.results || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Gagal mengambil rekomendasi'
      );
    } finally {
      setLoading(false);
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
            Rekomendasi resep berdasarkan bahan yang hampir expired.
          </p>
        </div>

        {message && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            {message}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p>Memuat rekomendasi...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">
              Belum ada rekomendasi resep yang tersedia.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {recipes.map((recipe, index) => (
              <div key={index} className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold">{recipe.nama_menu}</h2>

                <p className="text-slate-600 mt-3">
                  {recipe.bahan_resep}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {recipe.persentase_kecocokan}
                  </span>

                  <button
                    onClick={() => handleRecipeDetail(recipe)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {detailLoading && (
          <div className="bg-white rounded-2xl shadow p-6">
            <p>Memuat detail resep...</p>
          </div>
        )}

        {selectedRecipe && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedRecipe.nama_menu}
              </h2>

              <p className="text-slate-600 mt-2">
                {selectedRecipe.bahan_resep}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Langkah Memasak</h3>

              {selectedRecipe.langkah_memasak?.length > 0 ? (
                <div className="space-y-2">
                  {selectedRecipe.langkah_memasak.map((step, index) => (
                    <div key={index} className="border rounded-xl p-4">
                      <p>
                        <span className="font-bold">
                          Step {index + 1}:
                        </span>{' '}
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="text-slate-500">
                    Langkah memasak belum tersedia.
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Informasi Nutrisi</h3>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="text-slate-500">Kalori</p>
                  <h4 className="text-xl font-bold">
                    {selectedRecipe.nutrisi?.kalori || '-'}
                  </h4>
                </div>

                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="text-slate-500">Protein</p>
                  <h4 className="text-xl font-bold">
                    {selectedRecipe.nutrisi?.protein || '-'}
                  </h4>
                </div>

                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="text-slate-500">Lemak</p>
                  <h4 className="text-xl font-bold">
                    {selectedRecipe.nutrisi?.lemak || '-'}
                  </h4>
                </div>

                <div className="bg-slate-100 rounded-xl p-4">
                  <p className="text-slate-500">Karbohidrat</p>
                  <h4 className="text-xl font-bold">
                    {selectedRecipe.nutrisi?.karbohidrat || '-'}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}