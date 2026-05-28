import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="h-16 px-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 text-white p-2 rounded-xl">
              <ShieldCheck size={18} />
            </div>

            <span className="font-bold text-slate-800">Admin Panel</span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      <div className="md:ml-64">
        <main className="p-4 pt-20 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}