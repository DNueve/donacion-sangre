import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';
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

  // ── Compatibilidad OMS (misma tabla que el backend) ──────────────────────
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

  const esCompatible = (tipoSangreDonante, tipoSangreReceptor) => {
    return COMPATIBILIDAD[tipoSangreDonante]?.includes(tipoSangreReceptor) ?? false;
  };

  // ── Cargar solicitudes ───────────────────────────────────────────────────
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

  // ── Filtros ──────────────────────────────────────────────────────────────
  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroUrgencia !== 'TODAS' && s.urgencia !== filtroUrgencia) return false;
    if (filtroSangre !== 'TODAS' && s.tipoSangre !== filtroSangre) return false;
    if (soloCompatibles && user?.tipoSangre && !esCompatible(user.tipoSangre, s.tipoSangre)) return false;
    return true;
  });

  const colorUrgencia = {
    ALTA:  'border-[#ff4d6d]',
    MEDIA: 'border-[#f59e0b]',
    BAJA:  'border-[#43e97b]',
  };

  const bgUrgencia = {
    ALTA:  'from-[#ff4d6d]/5 to-transparent',
    MEDIA: 'from-[#f59e0b]/5 to-transparent',
    BAJA:  'from-[#43e97b]/5 to-transparent',
  };

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

        {/* Filtro urgencia */}
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

        {/* Filtro tipo sangre */}
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

        {/* Toggle compatibles */}
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

        {/* Contador */}
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
            <div
              key={s.id}
              className={`bg-gradient-to-br ${bgUrgencia[s.urgencia]} bg-[#111118] border border-[#1e1e2e] border-t-4 ${colorUrgencia[s.urgencia]} rounded-2xl p-6 flex flex-col gap-4 hover:border-opacity-100 transition-all`}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[#e8e8f0] text-lg truncate"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {s.bancoNombre}
                  </p>
                  <p className="text-sm text-[#52526a] mt-0.5">
                    📍 {s.bancoCiudad}
                    {s.fechaLimite && (
                      <span className="ml-2">· Límite: {new Date(s.fechaLimite).toLocaleDateString('es-CO')}</span>
                    )}
                  </p>
                </div>
                <UrgencyTag nivel={s.urgencia.toLowerCase()} />
              </div>

              {/* Info */}
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <p className="text-xs text-[#52526a] mb-1.5">Tipo requerido</p>
                  <BloodTypeBadge tipo={s.tipoSangre} />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-[#52526a] mb-1.5">Unidades faltantes</p>
                  <p className="text-3xl font-extrabold text-[#dc2626]"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {s.unidadesFaltantes}
                  </p>
                </div>
                {user?.tipoSangre && (
                  <div className="flex flex-col items-center ml-auto">
                    <p className="text-xs text-[#52526a] mb-1.5">Compatible</p>
                    <span className={`text-xl ${esCompatible(user.tipoSangre, s.tipoSangre) ? 'text-[#43e97b]' : 'text-[#52526a]'}`}>
                      {esCompatible(user.tipoSangre, s.tipoSangre) ? '✅' : '✗'}
                    </span>
                  </div>
                )}
              </div>

              {/* Motivo */}
              {s.motivo && (
                <p className="text-xs text-[#52526a] bg-[#08080f] rounded-lg px-3 py-2 border border-[#1e1e2e]">
                  💬 {s.motivo}
                </p>
              )}

              {/* Botón */}
              <button
                disabled={user?.tipoSangre && !esCompatible(user.tipoSangre, s.tipoSangre)}
                className="w-full py-2.5 rounded-xl text-sm font-extrabold tracking-wide text-white transition-all
                  bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/20
                  hover:shadow-xl hover:-translate-y-0.5
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {user?.tipoSangre && !esCompatible(user.tipoSangre, s.tipoSangre)
                  ? 'No compatible con tu tipo'
                  : '🩸 Quiero donar'}
              </button>
            </div>
          ))}
        </div>
      )}

    </Layout>
  );
}