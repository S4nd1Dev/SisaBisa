import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({
  itemName,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="bg-red-100 text-red-700 p-3 rounded-2xl">
            <AlertTriangle size={24} />
          </div>

          <button
            onClick={onCancel}
            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="text-xl font-bold mt-5">Hapus bahan ini?</h2>

        <p className="text-slate-600 mt-2">
          <span className="font-semibold">{itemName}</span> akan dihapus dari
          inventory. Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCancel}
            className="border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-100"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            className="bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}