import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';

export default function HomeBanco() {
  const inventario = [
    { tipo: 'O+', unidades: 45 },
    { tipo: 'O-', unidades: 8 },
    { tipo: 'A+', unidades: 32 },
    { tipo: 'A-', unidades: 12 },
    { tipo: 'B+', unidades: 20 },
    { tipo: 'B-', unidades: 5 },
    { tipo: 'AB+', unidades: 15 },
    { tipo: 'AB-', unidades: 3 },
  ];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Panel del Banco de Sangre 🏥</h1>
        <p className="text-gray-500">Gestiona tu inventario y solicitudes activas</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 mb-1">Donaciones este mes</p>
          <p className="text-4xl font-bold text-red-600">124</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-500 mb-1">Solicitudes activas</p>
          <p className="text-4xl font-bold text-yellow-500">7</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Total unidades disponibles</p>
          <p className="text-4xl font-bold text-green-600">140</p>
        </div>
      </div>

      {/* Inventario */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🩸 Inventario por tipo de sangre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inventario.map((item) => (
            <div key={item.tipo} className="flex flex-col items-center bg-gray-50 rounded-xl p-4 gap-2">
              <BloodTypeBadge tipo={item.tipo} />
              <p className="text-2xl font-bold text-gray-800">{item.unidades}</p>
              <p className="text-xs text-gray-400">unidades</p>
              {item.unidades < 10 && (
                <span className="text-xs text-red-500 font-semibold">⚠️ Stock bajo</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Solicitudes activas */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Solicitudes activas</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-semibold text-gray-700">Hospital General</p>
              <p className="text-sm text-gray-400">Solicitado hace 2 horas</p>
            </div>
            <div className="flex items-center gap-3">
              <BloodTypeBadge tipo="O-" />
              <UrgencyTag nivel="alta" />
            </div>
          </div>
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-semibold text-gray-700">Clínica del Norte</p>
              <p className="text-sm text-gray-400">Solicitado hace 5 horas</p>
            </div>
            <div className="flex items-center gap-3">
              <BloodTypeBadge tipo="AB-" />
              <UrgencyTag nivel="alta" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-700">Centro Médico Imbanaco</p>
              <p className="text-sm text-gray-400">Solicitado hace 1 día</p>
            </div>
            <div className="flex items-center gap-3">
              <BloodTypeBadge tipo="B+" />
              <UrgencyTag nivel="media" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}