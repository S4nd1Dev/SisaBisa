import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/user/AdminDashboard';
import Inventory from './pages/user/Inventory';
import Home from './pages/public/Home';
import { useAuth } from './context/AuthContext';
import Recommendations from './pages/user/Recommendations';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  return token ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}

function RedirectUnknownRoute() {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/" replace />;

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<RedirectUnknownRoute />} />
      </Routes>
    </BrowserRouter>
  );
}