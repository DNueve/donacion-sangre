import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';
import { useAuth } from '../context/AuthContext';

export default function HomeDonante() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola, {user?.nombre} 👋
        </h1>
        <p className="text-gray-500">Bienvenido a tu panel de donante</p>
      </div>

      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 mb-1">Tu tipo de sangre</p>
          <BloodTypeBadge tipo="O+" />
          <p className="text-xs text-gray-400 mt-3">Donante universal ❤️</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-500 mb-1">Próxima donación disponible</p>
          <p className="text-2xl font-bold text-gray-800">15 Jun 2025</p>
          <p className="text-xs text-gray-400 mt-3">Faltan 40 días</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Total de donaciones</p>
          <p className="text-4xl font-bold text-green-600">3</p>
          <p className="text-xs text-gray-400 mt-3">¡Gracias por salvar vidas!</p>
        </div>

      </div>

      {/* Urgencias cercanas */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🚨 Urgencias cercanas</h2>
        <div className="flex flex-col gap-4">

          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-semibold text-gray-700">Hospital San Rafael</p>
              <p className="text-sm text-gray-400">Medellín · 2.3 km</p>
            </div>
            <div className="flex items-center gap-3">
              <BloodTypeBadge tipo="O-" />
              <UrgencyTag nivel="alta" />
            </div>
          </div>

          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-semibold text-gray-700">Clínica Las Américas</p>
              <p className="text-sm text-gray-400">Medellín · 4.1 km</p>
            </div>
            <div className="flex items-center gap-3">
              <BloodTypeBadge tipo="A+" />
              <UrgencyTag nivel="media" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700">Banco de Sangre Antioquia</p>
              <p className="text-sm text-gray-400">Medellín · 5.8 km</p>
            </div>
            <div className="flex items-center gap-3">
              <BloodTypeBadge tipo="B+" />
              <UrgencyTag nivel="baja" />
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}