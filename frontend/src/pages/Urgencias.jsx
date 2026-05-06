import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';

const urgencias = [
  {
    id: 1,
    hospital: 'Hospital San Rafael',
    ciudad: 'Medellín',
    tipo: 'O-',
    nivel: 'alta',
    unidades: 5,
    tiempo: 'Hace 30 min',
  },
  {
    id: 2,
    hospital: 'Clínica Las Américas',
    ciudad: 'Medellín',
    tipo: 'A+',
    nivel: 'media',
    unidades: 3,
    tiempo: 'Hace 2 horas',
  },
  {
    id: 3,
    hospital: 'Hospital Pablo Tobón',
    ciudad: 'Medellín',
    tipo: 'AB-',
    nivel: 'alta',
    unidades: 2,
    tiempo: 'Hace 1 hora',
  },
  {
    id: 4,
    hospital: 'Clínica del Norte',
    ciudad: 'Bello',
    tipo: 'B+',
    nivel: 'baja',
    unidades: 4,
    tiempo: 'Hace 5 horas',
  },
  {
    id: 5,
    hospital: 'Hospital General',
    ciudad: 'Itagüí',
    tipo: 'O+',
    nivel: 'media',
    unidades: 6,
    tiempo: 'Hace 3 horas',
  },
];

export default function Urgencias() {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🚨 Urgencias activas</h1>
        <p className="text-gray-500">Solicitudes de sangre que necesitan donantes ahora</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {urgencias.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 border-t-4 border-red-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800 text-lg">{u.hospital}</p>
                <p className="text-sm text-gray-400">📍 {u.ciudad} · {u.tiempo}</p>
              </div>
              <UrgencyTag nivel={u.nivel} />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-1">Tipo requerido</p>
                <BloodTypeBadge tipo={u.tipo} />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-1">Unidades</p>
                <p className="text-2xl font-bold text-red-600">{u.unidades}</p>
              </div>
            </div>

            <button className="bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              Quiero donar
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}