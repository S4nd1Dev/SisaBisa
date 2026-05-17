import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../layouts/UserLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const response = await api.get('/inventory');
      setItems(response.data.data);
    };

    fetchInventory();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredItems = items.filter((item) => {
    const expiredDate = new Date(item.expired_at);
    expiredDate.setHours(0, 0, 0, 0);
    return expiredDate < today;
  });

  const soonExpiredItems = items.filter((item) => {
    const expiredDate = new Date(item.expired_at);
    expiredDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (expiredDate - today) / (1000 * 60 * 60 * 24)
    );

    return diffDays >= 0 && diffDays <= 3;
  });

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl font-bold">
            Selamat datang, {user?.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Pantau bahan makanan dan kurangi makanan terbuang.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">Total Bahan</p>
            <h2 className="text-3xl font-bold mt-2">{items.length}</h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">Hampir Expired</p>
            <h2 className="text-3xl font-bold mt-2">
              {soonExpiredItems.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-500">Sudah Expired</p>
            <h2 className="text-3xl font-bold mt-2">
              {expiredItems.length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold mb-4">Bahan yang Perlu Diperhatikan</h2>

          {soonExpiredItems.length === 0 && expiredItems.length === 0 ? (
            <p className="text-slate-500">
              Semua bahan masih aman.
            </p>
          ) : (
            <div className="space-y-3">
              {[...expiredItems, ...soonExpiredItems].map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 flex justify-between"
                >
                  <div>
                    <h3 className="font-bold">{item.ingredient_name}</h3>
                    <p className="text-sm text-slate-600">
                      Expired: {item.expired_at}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}