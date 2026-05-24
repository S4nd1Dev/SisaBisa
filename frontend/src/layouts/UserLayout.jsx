import Sidebar from '../components/Sidebar';

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <div className="md:ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}