import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import { useAuth } from '../context/AuthContext';
import { bancoService, solicitudService, inventarioService } from '../services/api';

export default function HomeSuperAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBancos: 0,
    bancosActivos: 0,
    solicitudesActivas: 0,
    tiposBajoStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [resBancos, resBancosAct, resSol, resBajoStock] = await Promise.all([
          bancoService.listarTodos(),
          bancoService.listarActivos(),
          solicitudService.listarActivas(),
          inventarioService.listarTodoBajoStock(),
        ]);

        setStats({
          totalBancos: resBancos.data.length,
          bancosActivos: resBancosAct.data.length,
          solicitudesActivas: resSol.data.length,
          tiposBajoStock: resBajoStock.data.length,
        });
      } catch (err) {
        console.error('Error cargando stats globales:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const accesosRapidos = [
    {
      titulo: 'Gestión de Bancos',
      descripcion: 'Crear, editar y administrar los bancos de sangre del sistema. Incluye asignación de admins.',
      icono: '🏦',
      path: '/super-admin/bancos',
      tipo: 'maestra',
    },
    {
      titulo: 'Centro de Reportes',
      descripcion: 'Genera y descarga reportes de donaciones e inventario en formato Excel con filtros por fecha.',
      icono: '📊',
      path: '/super-admin/reportes',
      tipo: 'reportes',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-[#1e1e2e] rounded-2xl animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-1"
           style={{ fontFamily: "'Syne', sans-serif" }}>
          Panel Super Administrador
        </p>
        <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          Hola, {user?.nombre} 👋
        </h1>
        <p className="text-[#52526a]">
          Vista global del sistema DonaVida · gestiona bancos y consulta reportes consolidados.
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          variant="gradient"
          gradient="from-[#dc2626] to-[#991b1b]"
          icon="🏦"
          label="Bancos totales"
          value={stats.totalBancos}
          subtitle={`${stats.bancosActivos} activos`}
        />
        <StatCard
          icon="✅"
          label="Bancos activos"
          value={stats.bancosActivos}
          subtitle="operando ahora"
          valueColor="text-[#43e97b]"
        />
        <StatCard
          icon="🚨"
          label="Solicitudes activas"
          value={stats.solicitudesActivas}
          subtitle="urgencias abiertas"
          valueColor={stats.solicitudesActivas > 0 ? 'text-[#f59e0b]' : 'text-[#43e97b]'}
        />
        <StatCard
          icon="⚠️"
          label="Alertas de stock"
          value={stats.tiposBajoStock}
          subtitle="tipos bajo mínimo"
          valueColor={stats.tiposBajoStock > 0 ? 'text-[#dc2626]' : 'text-[#43e97b]'}
        />
      </div>

      {/* Accesos rápidos */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-[#e8e8f0] mb-4"
            style={{ fontFamily: "'Syne', sans-serif" }}>
          ⚡ Accesos rápidos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accesosRapidos.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="text-left bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 hover:border-[#dc2626]/50 hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{item.icono}</div>
                <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  item.tipo === 'reportes'
                    ? 'bg-[rgba(220,38,38,0.1)] border border-[#dc2626]/30 text-[#dc2626]'
                    : 'bg-[rgba(67,233,123,0.08)] border border-[#43e97b]/30 text-[#43e97b]'
                }`}>
                  {item.tipo}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#e8e8f0] mb-1 group-hover:text-[#dc2626] transition-colors"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                {item.titulo}
              </h3>
              <p className="text-sm text-[#52526a] leading-relaxed">
                {item.descripcion}
              </p>
              <div className="mt-4 flex items-center gap-1 text-[#dc2626] text-xs font-bold"
                   style={{ fontFamily: "'Syne', sans-serif" }}>
                ABRIR
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="text-sm font-extrabold text-[#e8e8f0] mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}>
              Alcance del rol Super Administrador
            </h3>
            <p className="text-sm text-[#52526a] leading-relaxed">
              Como super admin, puedes gestionar todos los bancos de sangre del sistema, ver métricas globales
              y consultar los reportes consolidados. Los administradores de cada banco gestionan sus operaciones
              diarias (inventario, citas, solicitudes) desde sus propios paneles.
            </p>
          </div>
        </div>
      </div>

    </Layout>
  );
}