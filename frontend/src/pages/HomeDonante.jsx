import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import UrgenciaCard from '../components/ui/UrgenciaCard';
import { useAuth } from '../context/AuthContext';

export default function HomeDonante() {
  const { user } = useAuth();

  // Datos mock (después vendrán del backend)
  const proximaDonacion = 47;
  const totalDonaciones = 3;
  const vidasSalvadas = totalDonaciones * 3;

  const urgenciasMock = [
    { id: 1, banco: 'Hospital San Rafael', tipoSangre: 'O-', urgencia: 'ALTA', unidades: 3, distanciaKm: 2.3, fechaLimite: '2026-05-10' },
    { id: 2, banco: 'Clínica Las Américas', tipoSangre: 'A+', urgencia: 'MEDIA', unidades: 5, distanciaKm: 4.1, fechaLimite: '2026-05-15' },
    { id: 3, banco: 'Banco de Sangre Antioquia', tipoSangre: 'B+', urgencia: 'BAJA', unidades: 2, distanciaKm: 5.8, fechaLimite: '2026-05-20' },
  ];

  // Mensaje según tipo de sangre
  const mensajeTipo = {
    'O-': 'Eres donante universal — tu sangre puede salvar a cualquiera',
    'O+': 'Eres donante universal del grupo positivo',
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
          value={proximaDonacion}
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

        <div className="space-y-3">
          {urgenciasMock.map(u => (
            <UrgenciaCard 
              key={u.id} 
              urgencia={u} 
              onClick={() => alert(`Has aceptado ayudar en: ${u.banco}`)}
            />
          ))}
        </div>
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