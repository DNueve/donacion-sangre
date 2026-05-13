import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';
import StatCard from '../components/ui/StatCard';
import { useAuth } from '../context/AuthContext';
import { bancoService, solicitudService, donacionService, inventarioService } from '../services/api';

export default function HomeBanco() {
  const { user } = useAuth();

  const [banco, setBanco] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [donacionesMes, setDonacionesMes] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Cargar datos del banco del admin logueado ─────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        // Buscar el banco donde este usuario es admin
        const resBancos = await bancoService.listarActivos();
        const miBanco = resBancos.data.find(b => b.admin?.id === user?.id);

        if (!miBanco) {
          setLoading(false);
          return;
        }

        setBanco(miBanco);

        // Cargar inventario, solicitudes y donaciones en paralelo
        const [resInv, resSol, resDon] = await Promise.all([
          inventarioService.listarPorBanco(miBanco.id),
          solicitudService.listarPorBancoYEstado(miBanco.id, 'ACTIVA'),
          donacionService.listarPorBanco(miBanco.id),
        ]);

        setInventario(resInv.data);
        setSolicitudes(resSol.data);

        // Donaciones completadas este mes
        const hoy = new Date();
        const completadasMes = resDon.data.filter(d => {
          if (d.estado !== 'COMPLETADA') return false;
          const fecha = new Date(d.fechaDonacion);
          return fecha.getMonth() === hoy.getMonth() &&
                 fecha.getFullYear() === hoy.getFullYear();
        });
        setDonacionesMes(completadasMes.length);

      } catch (err) {
        console.error('Error cargando datos del banco:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) cargar();
  }, [user]);

  const totalUnidades = inventario.reduce((acc, i) => acc + i.unidadesDisponibles, 0);
  const tiposBajoStock = inventario.filter(i => i.bajoStock).length;

  const colorUrgencia = { ALTA: 'border-[#ff4d6d]', MEDIA: 'border-[#f59e0b]', BAJA: 'border-[#43e97b]' };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-[#1e1e2e] rounded-2xl animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  if (!banco) {
    return (
      <Layout>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🏥</p>
          <p className="text-[#e8e8f0] font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No tienes un banco asignado
          </p>
          <p className="text-[#52526a] text-sm">
            Contacta al administrador para que te asigne un banco de sangre.
          </p>
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
          Panel de administración
        </p>
        <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          {banco.nombre}
        </h1>
        <p className="text-[#52526a]">
          📍 {banco.direccion}, {banco.ciudad}
          {banco.horarioApertura && (
            <span className="ml-3">🕐 {banco.horarioApertura} - {banco.horarioCierre}</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          variant="gradient"
          gradient="from-[#dc2626] to-[#991b1b]"
          icon="🩸"
          label="Donaciones este mes"
          value={donacionesMes}
          subtitle="completadas"
        />
        <StatCard
          icon="📋"
          label="Solicitudes activas"
          value={solicitudes.length}
          subtitle="pendientes de cubrir"
          valueColor={solicitudes.length > 0 ? 'text-[#f59e0b]' : 'text-[#43e97b]'}
        />
        <StatCard
          icon="🏦"
          label="Unidades disponibles"
          value={totalUnidades}
          subtitle={tiposBajoStock > 0 ? `⚠️ ${tiposBajoStock} tipo${tiposBajoStock > 1 ? 's' : ''} bajo mínimo` : 'Stock saludable'}
          valueColor={tiposBajoStock > 0 ? 'text-[#f59e0b]' : 'text-[#43e97b]'}
        />
      </div>

      {/* Inventario */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-[#e8e8f0]"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            🩸 Inventario por tipo de sangre
          </h2>
          {tiposBajoStock > 0 && (
            <span className="text-xs font-bold text-[#f59e0b] bg-[rgba(245,158,11,0.1)] border border-[#f59e0b]/30 px-3 py-1 rounded-full">
              ⚠️ {tiposBajoStock} tipo{tiposBajoStock > 1 ? 's' : ''} bajo mínimo
            </span>
          )}
        </div>

        {inventario.length === 0 ? (
          <p className="text-[#52526a] text-sm text-center py-4">
            No hay inventario registrado aún.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {inventario.map(item => (
              <div
                key={item.id}
                className={`flex flex-col items-center rounded-xl p-4 gap-2 border transition-all ${
                  item.bajoStock
                    ? 'bg-[rgba(220,38,38,0.05)] border-[#dc2626]/30'
                    : 'bg-[#08080f] border-[#1e1e2e]'
                }`}
              >
                <BloodTypeBadge tipo={item.tipoSangre} />
                <p className={`text-3xl font-extrabold ${item.bajoStock ? 'text-[#dc2626]' : 'text-[#e8e8f0]'}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.unidadesDisponibles}
                </p>
                <p className="text-xs text-[#52526a]">unidades</p>
                {item.bajoStock && (
                  <span className="text-xs text-[#dc2626] font-bold">⚠️ Stock bajo</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Solicitudes activas */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-[#e8e8f0]"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            📋 Solicitudes activas
          </h2>
          <span className="text-xs text-[#52526a]">
            {solicitudes.length} activa{solicitudes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {solicitudes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-[#52526a] text-sm">No hay solicitudes activas en este momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {solicitudes.map((s, idx) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-4 rounded-xl border-l-4 bg-[#08080f] border border-[#1e1e2e] ${colorUrgencia[s.urgencia]}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <BloodTypeBadge tipo={s.tipoSangre} />
                    <UrgencyTag nivel={s.urgencia.toLowerCase()} />
                  </div>
                  <p className="text-sm text-[#52526a] truncate">
                    {s.motivo || 'Sin motivo especificado'}
                  </p>
                  {s.fechaLimite && (
                    <p className="text-xs text-[#52526a] mt-1">
                      Límite: {new Date(s.fechaLimite).toLocaleDateString('es-CO')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 ml-4 shrink-0">
                  <p className="text-2xl font-extrabold text-[#dc2626]"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {s.unidadesFaltantes}
                  </p>
                  <p className="text-xs text-[#52526a]">unidades faltantes</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </Layout>
  );
}