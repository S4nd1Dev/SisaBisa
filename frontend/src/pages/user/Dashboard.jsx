import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold">Dashboard User</h1>

        <p className="mt-2">
          Selamat datang, {user?.name}
        </p>

        {/* BUTTON INVENTORY */}
        <a
          href="/inventory"
          className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Buka Inventory
        </a>

        {/* BUTTON LOGOUT */}
        <button
          onClick={logout}
          className="mt-4 ml-4 bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}