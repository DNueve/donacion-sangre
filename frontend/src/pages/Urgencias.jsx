import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import UrgenciaCard from '../components/ui/UrgenciaCard';
import { useAuth } from '../context/AuthContext';
import { solicitudService } from '../services/api';

const URGENCIA_ORDER = { ALTA: 0, MEDIA: 1, BAJA: 2 };

export default function Urgencias() {
  const { user } = useAuth();

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroUrgencia, setFiltroUrgencia] = useState('TODAS');
  const [filtroSangre, setFiltroSangre] = useState('TODAS');
  const [soloCompatibles, setSoloCompatibles] = useState(false);

  const COMPATIBILIDAD = {
    'O-':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
    'O+':  ['O+','A+','B+','AB+'],
    'A-':  ['A-','A+','AB-','AB+'],
    'A+':  ['A+','AB+'],
    'B-':  ['B-','B+','AB-','AB+'],
    'B+':  ['B+','AB+'],
    'AB-': ['AB-','AB+'],
    'AB+': ['AB+'],
  };

  const esCompatible = (donante, receptor) =>
    COMPATIBILIDAD[donante]?.includes(receptor) ?? false;

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await solicitudService.listarActivas();
        const ordenadas = res.data.sort(
          (a, b) => URGENCIA_ORDER[a.urgencia] - URGENCIA_ORDER[b.urgencia]
        );
        setSolicitudes(ordenadas);
      } catch (err) {
        console.error('Error cargando urgencias:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroUrgencia !== 'TODAS' && s.urgencia !== filtroUrgencia) return false;
    if (filtroSangre !== 'TODAS' && s.tipoSangre !== filtroSangre) return false;
    if (soloCompatibles && user?.tipoSangre && !esCompatible(user.tipoSangre, s.tipoSangre)) return false;
    return true;
  });

  return (
    <Layout>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          🚨 Urgencias activas
        </h1>
        <p className="text-[#52526a]">
          Solicitudes de sangre que necesitan donantes ahora
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">

        <div className="flex gap-2">
          {['TODAS', 'ALTA', 'MEDIA', 'BAJA'].map(u => (
            <button
              key={u}
              onClick={() => setFiltroUrgencia(u)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                filtroUrgencia === u
                  ? 'bg-[#dc2626] border-[#dc2626] text-white'
                  : 'bg-transparent border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50'
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {u}
            </button>
          ))}
        </div>

        <select
          value={filtroSangre}
          onChange={e => setFiltroSangre(e.target.value)}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-transparent border border-[#1e1e2e] text-[#e8e8f0] outline-none cursor-pointer"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <option value="TODAS">Todos los tipos</option>
          {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {user?.tipoSangre && (
          <button
            onClick={() => setSoloCompatibles(!soloCompatibles)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 ${
              soloCompatibles
                ? 'bg-[#dc2626] border-[#dc2626] text-white'
                : 'bg-transparent border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50'
            }`}
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            🩸 Solo compatibles con {user.tipoSangre}
          </button>
        )}

        <span className="ml-auto text-xs text-[#52526a] self-center">
          {solicitudesFiltradas.length} solicitud{solicitudesFiltradas.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-[#1e1e2e] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-[#e8e8f0] font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No hay urgencias con estos filtros
          </p>
          <p className="text-[#52526a] text-sm">
            Intenta cambiar los filtros o vuelve más tarde
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solicitudesFiltradas.map(s => (
            <UrgenciaCard
              key={s.id}
              urgencia={{
                id: s.id,
                bancoId: s.bancoId,
                banco: s.bancoNombre,
                tipoSangre: s.tipoSangre,
                urgencia: s.urgencia,
                unidades: s.unidadesFaltantes,
                distanciaKm: s.distanciaKm ?? '—',
                fechaLimite: s.fechaLimite,
                motivo: s.motivo,
              }}
            />
          ))}
        </div>
      )}

    </Layout>
  );
}