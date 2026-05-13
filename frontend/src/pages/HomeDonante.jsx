import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import UrgenciaCard from '../components/ui/UrgenciaCard';
import { useAuth } from '../context/AuthContext';
import { solicitudService, donacionService } from '../services/api';

export default function HomeDonante() {
  const { user } = useAuth();

  const [urgencias, setUrgencias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loadingUrgencias, setLoadingUrgencias] = useState(true);
  const [diasProximaDonacion, setDiasProximaDonacion] = useState(null);

  // ── Cargar urgencias compatibles con el tipo de sangre del donante ────────
  useEffect(() => {
    const cargarUrgencias = async () => {
      try {
        setLoadingUrgencias(true);

        // Si el navegador tiene geolocalización, busca por radio
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              const res = await solicitudService.buscarPorTipoSangreEnRadio(
                user.tipoSangre, latitude, longitude, 50
              );
              setUrgencias(res.data.slice(0, 3)); // solo 3 en home
              setLoadingUrgencias(false);
            },
            async () => {
              // Sin permisos de ubicación — carga todas las activas del tipo
              const res = await solicitudService.listarPorTipoSangre(user.tipoSangre);
              setUrgencias(res.data.slice(0, 3));
              setLoadingUrgencias(false);
            }
          );
        } else {
          const res = await solicitudService.listarPorTipoSangre(user.tipoSangre);
          setUrgencias(res.data.slice(0, 3));
          setLoadingUrgencias(false);
        }
      } catch (err) {
        console.error('Error cargando urgencias:', err);
        setLoadingUrgencias(false);
      }
    };

    if (user?.tipoSangre) cargarUrgencias();
  }, [user]);

  // ── Cargar historial de donaciones ────────────────────────────────────────
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await donacionService.historialUsuario(user.id);
        setHistorial(res.data);

        // Calcular días para próxima donación
        const completadas = res.data.filter(d => d.estado === 'COMPLETADA');
        if (completadas.length > 0) {
          const ultima = new Date(completadas[0].fechaDonacion);
          const proxima = new Date(ultima);
          proxima.setDate(proxima.getDate() + 90);
          const hoy = new Date();
          const dias = Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24));
          setDiasProximaDonacion(dias > 0 ? dias : 0);
        }
      } catch (err) {
        console.error('Error cargando historial:', err);
      }
    };

    if (user?.id) cargarHistorial();
  }, [user]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const totalDonaciones = historial.filter(d => d.estado === 'COMPLETADA').length;
  const vidasSalvadas = totalDonaciones * 3;

  const mensajeTipo = {
    'O-':  'Eres donante universal — tu sangre puede salvar a cualquiera',
    'O+':  'Eres donante universal del grupo positivo',
    'AB+': 'Eres receptor universal',
  };

  const colorTipo = {
    'O+':  'from-[#dc2626] to-[#991b1b]',
    'O-':  'from-[#ff4d6d] to-[#dc2626]',
    'A+':  'from-[#f59e0b] to-[#dc2626]',
    'A-':  'from-[#fbbf24] to-[#f59e0b]',
    'B+':  'from-[#8b5cf6] to-[#6d28d9]',
    'B-':  'from-[#a78bfa] to-[#8b5cf6]',
    'AB+': 'from-[#ec4899] to-[#be185d]',
    'AB-': 'from-[#f472b6] to-[#ec4899]',
  };

  // Mapear respuesta del backend al formato que espera UrgenciaCard
  const mapearUrgencia = (s) => ({
    id: s.id,
    bancoId: s.bancoId, 
    banco: s.bancoNombre,
    tipoSangre: s.tipoSangre,
    urgencia: s.urgencia,
    unidades: s.unidadesFaltantes ?? s.unidadesNecesarias,
    distanciaKm: s.distanciaKm ?? '—',
    fechaLimite: s.fechaLimite,
  });

  return (
    <Layout>

      {/* Bienvenida */}
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Hola, {user?.nombre} 👋
        </h2>
        <p className="text-[#52526a] text-lg">
          {mensajeTipo[user?.tipoSangre] || 'Tu donación puede salvar hasta 3 vidas'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          variant="gradient"
          gradient={colorTipo[user?.tipoSangre] || 'from-[#dc2626] to-[#991b1b]'}
          icon="🩸"
          label="Mi tipo de sangre"
          value={user?.tipoSangre || 'N/A'}
          subtitle="Listo para donar"
        />
        <StatCard
          icon="📅"
          label="Próxima donación"
          value={diasProximaDonacion !== null ? diasProximaDonacion : '—'}
          subtitle="días restantes"
        />
        <StatCard
          icon="❤️"
          label="Vidas salvadas"
          value={vidasSalvadas}
          subtitle={`con ${totalDonaciones} donaciones`}
          valueColor="text-[#43e97b]"
          hoverColor="hover:border-[#43e97b]/30"
        />
      </div>

      {/* Urgencias */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-extrabold flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              🚨 Urgencias cerca de ti
            </h3>
            <p className="text-[#52526a] text-sm mt-1">
              Solicitudes compatibles con tu tipo de sangre
            </p>
          </div>
          <a href="/urgencias" className="text-[#dc2626] text-sm font-bold hover:underline" style={{ fontFamily: "'Syne', sans-serif" }}>
            Ver todas →
          </a>
        </div>

        {loadingUrgencias ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-[#1e1e2e] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : urgencias.length === 0 ? (
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-[#52526a]">No hay urgencias activas para tu tipo de sangre en este momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {urgencias.map(s => (
              <UrgenciaCard
                key={s.id}
                urgencia={mapearUrgencia(s)}
                onClick={() => alert(`Has aceptado ayudar en: ${s.bancoNombre}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cards inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/mapa" className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] rounded-2xl p-6 relative overflow-hidden hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 text-9xl opacity-10">🗺️</div>
          <div className="relative z-10">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Bancos cerca de ti
            </p>
            <h4 className="text-2xl font-extrabold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Encuentra dónde donar
            </h4>
            <p className="text-white/70 text-sm mb-4">
              Mira en el mapa los centros de donación más cercanos
            </p>
            <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg text-sm font-bold text-white">
              Ver mapa →
            </span>
          </div>
        </a>

        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-5">💡</div>
          <div className="relative z-10">
            <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              ¿Sabías que?
            </p>
            <h4 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Una donación = 3 vidas
            </h4>
            <p className="text-[#52526a] text-sm leading-relaxed">
              Cada bolsa de sangre se separa en 3 componentes: glóbulos rojos, plasma y plaquetas. 
              Por eso una sola donación tuya puede ayudar a 3 personas distintas.
            </p>
          </div>
        </div>
      </div>

    </Layout>
  );
}