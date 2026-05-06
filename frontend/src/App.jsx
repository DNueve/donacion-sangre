import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import HomeDonante from './pages/HomeDonante';
import HomeBanco from './pages/HomeBanco';
import Urgencias from './pages/Urgencias';
import MapaBancos from './pages/MapaBancos';

// Componente que protege rutas según el usuario y su rol
function RutaProtegida({ children, rol }) {
  const { user } = useAuth();
  
  // Si no hay usuario logueado, redirige al login
  if (!user) return <Navigate to="/login" />;
  
  // Si la ruta requiere un rol específico y el usuario no lo tiene, redirige
  if (rol && user.rol !== rol) return <Navigate to="/login" />;
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas protegidas - DONANTE */}
          <Route path="/home-donante" element={
            <RutaProtegida rol="DONANTE">
              <HomeDonante />
            </RutaProtegida>
          } />

          {/* Rutas protegidas - ADMIN_BANCO */}
          <Route path="/home-banco" element={
            <RutaProtegida rol="ADMIN_BANCO">
              <HomeBanco />
            </RutaProtegida>
          } />

          {/* Rutas protegidas - cualquier usuario logueado */}
          <Route path="/urgencias" element={
            <RutaProtegida>
              <Urgencias />
            </RutaProtegida>
          } />
          <Route path="/mapa" element={
            <RutaProtegida>
              <MapaBancos />
            </RutaProtegida>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;