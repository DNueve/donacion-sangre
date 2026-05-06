import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!correo || !contrasena) {
      setError('Por favor completa todos los campos.');
      return;
    }

    // Simulación de login con datos falsos
    if (correo === 'donante@test.com' && contrasena === '1234') {
      login({ nombre: 'Carlos López', rol: 'donante' }, 'token-falso-donante');
      navigate('/home-donante');
    } else if (correo === 'banco@test.com' && contrasena === '1234') {
      login({ nombre: 'Banco San Rafael', rol: 'banco' }, 'token-falso-banco');
      navigate('/home-banco');
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-red-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-5xl">🩸</span>
          <h1 className="text-3xl font-bold text-red-600 mt-2">DonaVida</h1>
          <p className="text-gray-500 text-sm mt-1">Cada gota cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Correo electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition mt-2"
          >
            Iniciar sesión
          </button>

          <p className="text-center text-sm text-gray-500 mt-2">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="text-red-600 font-semibold hover:underline">
              Regístrate aquí
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}