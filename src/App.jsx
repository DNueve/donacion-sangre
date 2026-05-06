import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import HomeDonante from './pages/HomeDonante';
import HomeBanco from './pages/HomeBanco';
import Urgencias from './pages/Urgencias';
import MapaBancos from './pages/MapaBancos';

function RutaProtegida({ children, rol }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (rol && user.rol !== rol) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/home-donante" element={
            <RutaProtegida rol="donante">
              <HomeDonante />
            </RutaProtegida>
          } />
          <Route path="/home-banco" element={
            <RutaProtegida rol="banco">
              <HomeBanco />
            </RutaProtegida>
          } />
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