import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-red-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🩸</span>
        <span className="font-bold text-xl tracking-wide">DonaVida</span>
      </div>

      <div className="flex items-center gap-6">
        {user?.rol === 'donante' && (
          <>
            <Link to="/home-donante" className="hover:text-red-200 transition">Inicio</Link>
            <Link to="/urgencias" className="hover:text-red-200 transition">Urgencias</Link>
            <Link to="/mapa" className="hover:text-red-200 transition">Mapa</Link>
          </>
        )}
        {user?.rol === 'banco' && (
          <>
            <Link to="/home-banco" className="hover:text-red-200 transition">Inicio</Link>
            <Link to="/urgencias" className="hover:text-red-200 transition">Urgencias</Link>
            <Link to="/mapa" className="hover:text-red-200 transition">Mapa</Link>
          </>
        )}
        {user && (
          <button
            onClick={handleLogout}
            className="bg-white text-red-800 px-4 py-1 rounded-full font-semibold hover:bg-red-100 transition"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
}