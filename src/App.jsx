import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import BookingPage from './pages/client/BookingPage.jsx'
import LoginPage from './pages/admin/LoginPage.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import SolicitudesPage from './pages/admin/SolicitudesPage.jsx'
import ChoferesPage from './pages/admin/ChoferesPage.jsx'
import ZonasPage from './pages/admin/ZonasPage.jsx'
import BloqueadasPage from './pages/admin/BloqueadasPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Client */}
        <Route path="/" element={<BookingPage />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin (protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="solicitudes" element={<SolicitudesPage />} />
          <Route path="choferes"    element={<ChoferesPage />} />
          <Route path="zonas"       element={<ZonasPage />} />
          <Route path="bloqueadas"  element={<BloqueadasPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
