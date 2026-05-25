import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function UserLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 bg-white border shadow-sm p-3 rounded-xl"
      >
        <Menu size={22} />
      </button>

      <div className="md:ml-64">
        <main className="p-4 pt-20 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}