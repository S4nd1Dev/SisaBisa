import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({
  itemName,
  onCancel,
  onConfirm,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-start gap-4">
          <motion.div
            initial={{ rotate: -8, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="bg-red-100 text-red-700 p-3 rounded-2xl"
          >
            <AlertTriangle size={24} />
          </motion.div>

          <button
            onClick={onCancel}
            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        <h2 className="text-xl font-bold mt-5">Hapus bahan ini?</h2>

        <p className="text-slate-600 mt-2 leading-relaxed">
          <span className="font-semibold">{itemName}</span> akan dihapus dari
          inventory. Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            className="border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Batal
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Hapus
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}