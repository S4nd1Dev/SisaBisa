import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function UserLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <div className="md:ml-64">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="font-bold text-slate-800">
                Halo, {user?.name}
              </h1>
              <p className="text-sm text-slate-500">
                Kelola bahan makananmu dengan lebih mudah.
              </p>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}