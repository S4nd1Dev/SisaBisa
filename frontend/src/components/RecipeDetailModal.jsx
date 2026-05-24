import { X } from 'lucide-react';

export default function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 rounded-full p-2"
        >
          <X size={18} />
        </button>

        <div className="pr-10">
          <p className="text-green-700 font-semibold mb-2">
            Detail Resep AI
          </p>

          <h2 className="text-2xl font-bold">
            {recipe.nama_menu}
          </h2>

          <p className="text-slate-600 mt-2">
            {recipe.bahan_resep}
          </p>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-lg mb-3">
            Langkah Memasak
          </h3>

          {recipe.langkah_memasak?.length > 0 ? (
            <div className="space-y-2">
              {recipe.langkah_memasak.map((step, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 bg-slate-50"
                >
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

        <div className="mt-6">
          <h3 className="font-bold text-lg mb-3">
            Informasi Nutrisi
          </h3>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-slate-500">Kalori</p>
              <h4 className="text-xl font-bold">
                {recipe.nutrisi?.kalori || '-'}
              </h4>
            </div>

            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-slate-500">Protein</p>
              <h4 className="text-xl font-bold">
                {recipe.nutrisi?.protein || '-'}
              </h4>
            </div>

            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-slate-500">Lemak</p>
              <h4 className="text-xl font-bold">
                {recipe.nutrisi?.lemak || '-'}
              </h4>
            </div>

            <div className="bg-slate-100 rounded-xl p-4">
              <p className="text-slate-500">Karbohidrat</p>
              <h4 className="text-xl font-bold">
                {recipe.nutrisi?.karbohidrat || '-'}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}