import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Restaurants from './pages/Restaurants'
import Hotels from './pages/Hotels';
import Users from './pages/Users'
import Orders from './pages/Orders'
import Bookings from './pages/Bookings'
import Reviews from './pages/Reviews'
import Finance from './pages/Finance'
import Reports from './pages/Reports'
import Support from './pages/Support'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#c9a84c' }}>Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<Orders />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="finance" element={<Finance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
