import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Leaf,
  ChefHat,
  X,
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
  ];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/');
  };

  return (
    <>
      {isOpen && (
        <button
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          aria-label="Tutup sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r flex flex-col z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white p-2 rounded-xl">
              <Leaf size={20} />
            </div>

            <span className="font-bold text-xl text-green-700">
              SisaBisa
            </span>
          </div>

          <button
            onClick={onClose}
            className="md:hidden bg-slate-100 p-2 rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                  active
                    ? 'bg-green-100 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}