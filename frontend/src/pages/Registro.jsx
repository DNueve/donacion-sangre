import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    correo: '',
    contrasena: '',
    tipoSangre: '',
    ciudad: '',
    telefono: '',
    fechaNacimiento: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const camposVacios = Object.values(form).some((v) => v === '');
    if (camposVacios) {
      setError('Por favor completa todos los campos.');
      return;
    }
    // Aquí irá la llamada al backend
    alert('¡Registro exitoso! (simulado)');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-red-800 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">

        <div className="text-center mb-6">
          <span className="text-4xl">🩸</span>
          <h1 className="text-2xl font-bold text-red-600 mt-2">Crear cuenta</h1>
          <p className="text-gray-400 text-sm">Únete y salva vidas</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Nombre completo</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Documento</label>
              <input
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="1234567890"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Correo electrónico</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="tucorreo@ejemplo.com"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Contraseña</label>
            <input
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Tipo de sangre</label>
              <select
                name="tipoSangre"
                value={form.tipoSangre}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="">Seleccionar</option>
                {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Ciudad</label>
              <input
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                placeholder="Medellín"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="3001234567"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Fecha de nacimiento</label>
              <input
                name="fechaNacimiento"
                type="date"
                value={form.fechaNacimiento}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition mt-2"
          >
            Registrarme
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-red-600 font-semibold hover:underline">
              Inicia sesión
            </a>
          </p>

        </form>
      </div>
    </div>
  );
}