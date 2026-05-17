import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  LogOut,
  Leaf,
  ChefHat,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
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
    navigate('/');
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b">
        <div className="bg-green-600 text-white p-2 rounded-xl">
          <Leaf size={20} />
        </div>

        <span className="font-bold text-xl text-green-700">
          SisaBisa
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
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
  );
}