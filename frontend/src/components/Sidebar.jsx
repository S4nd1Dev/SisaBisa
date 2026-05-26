import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Leaf,
  ChefHat,
  X,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Package,
    },
    {
      label: 'Rekomendasi',
      path: '/recommendations',
      icon: ChefHat,
    },
    {
      label: 'Favorit Resep',
      path: '/favorites',
      icon: Bookmark,
    },
  ];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            aria-label="Tutup sidebar"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-screen w-72 md:w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/70 flex flex-col z-50 transform transition-transform duration-300 ease-out shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.05 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-2xl shadow-lg shadow-green-200"
            >
              <Leaf size={20} />
            </motion.div>

            <div>
              <h1 className="font-bold text-2xl tracking-tight text-green-700">
                SisaBisa
              </h1>

              <p className="text-xs text-slate-500 mt-0.5">
                Smart Food Inventory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3">
            Main Menu
          </p>

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.06,
                }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-green-600"
                    />
                  )}

                  <div
                    className={`transition ${
                      active
                        ? 'text-green-700'
                        : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  >
                    <Icon size={21} />
                  </div>

                  <span className="text-[15px] font-semibold">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-gradient-to-t from-slate-50/80 to-white">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 font-medium transition-all"
          >
            <div className="group-hover:translate-x-0.5 transition">
              <LogOut size={20} />
            </div>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}