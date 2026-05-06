import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Links según rol del usuario
  const linksDonante = [
    { path: '/home-donante', label: 'INICIO' },
    { path: '/urgencias', label: 'URGENCIAS' },
    { path: '/mapa', label: 'MAPA' },
  ];

  const linksBanco = [
    { path: '/home-banco', label: 'INICIO' },
    { path: '/inventario', label: 'INVENTARIO' },
    { path: '/solicitudes', label: 'SOLICITUDES' },
  ];

  const links = user?.rol === 'ADMIN_BANCO' ? linksBanco : linksDonante;

  return (
    <nav className="bg-[#111118]/80 backdrop-blur-md border-b border-[#1e1e2e] sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" 
             onClick={() => navigate(user?.rol === 'ADMIN_BANCO' ? '/home-banco' : '/home-donante')}>
          <span className="text-2xl">🩸</span>
          <h1 className="text-xl font-extrabold text-[#e8e8f0]" 
              style={{ fontFamily: "'Syne', sans-serif" }}>
            DonaVida
          </h1>
        </div>

        {/* Links centro */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a 
              key={link.path}
              href={link.path}
              className={`text-sm font-bold transition-colors ${
                location.pathname === link.path 
                  ? 'text-[#dc2626]' 
                  : 'text-[#52526a] hover:text-[#e8e8f0]'
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#e8e8f0]">
              {user?.nombre} {user?.apellido}
            </p>
            <p className="text-xs text-[#52526a]">
              {user?.rol === 'ADMIN_BANCO' ? 'Admin Banco' : `Donante ${user?.tipoSangre || ''}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center font-bold text-white">
            {user?.nombre?.charAt(0) || '?'}
          </div>
          <button 
            onClick={handleLogout} 
            className="text-[#52526a] hover:text-[#ff4d6d] transition-colors text-lg ml-2" 
            title="Cerrar sesión"
          >
            ⏻
          </button>
        </div>
      </div>
    </nav>
  );
}