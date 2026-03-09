import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import Auth from './pages/Auth';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';


function App() {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/auth"
          element={!(token && user) ? <Auth /> : <Navigate to="/" />}
        />
        <Route
          path="/admin-login"
          element={!(token && user) ? <AdminLogin /> : <Navigate to="/" />}
        />

        <Route
          path="/dashboard"
          element={token && user?.role === 'user' ? <UserDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={token && (user?.role === 'admin' || user?.role === 'staff') ? <AdminDashboard /> : <Navigate to="/" />}
        />

        <Route path="/" element={<Navigate to={token && user ? ((user.role === 'admin' || user.role === 'staff') ? '/admin' : '/dashboard') : '/auth'} />} />
      </Routes>
    </Router>
  );
}

export default App;
