import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyTag from '../components/ui/UrgencyTag';
import StatCard from '../components/ui/StatCard';
import { useAuth } from '../context/AuthContext';
import { bancoService, solicitudService, donacionService, inventarioService } from '../services/api';

const FORM_COMPLETAR_VACIO = {
  unidades: 1,
  hemoglobina: '',
  presionArterial: '',
  observaciones: '',
};

export default function HomeBanco() {
  const { user } = useAuth();

  const [banco, setBanco] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [donacionesMes, setDonacionesMes] = useState(0);
  const [donacionesPendientes, setDonacionesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Modal de completar donación ──
  const [modalCompletar, setModalCompletar] = useState(false);
  const [donacionActiva, setDonacionActiva] = useState(null);
  const [formCompletar, setFormCompletar] = useState(FORM_COMPLETAR_VACIO);
  const [guardandoCompletar, setGuardandoCompletar] = useState(false);
  const [errorCompletar, setErrorCompletar] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const resBancos = await bancoService.listarActivos();
        const miBanco = resBancos.data.find(b => b.admin?.id === user?.id);
        if (!miBanco) { setLoading(false); return; }
        setBanco(miBanco);

        const [resInv, resSol, resDon] = await Promise.all([
          inventarioService.listarPorBanco(miBanco.id),
          solicitudService.listarPorBanco(miBanco.id),
          donacionService.listarPorBanco(miBanco.id),
        ]);

        setInventario(resInv.data);
        setSolicitudes(resSol.data);
        setDonacionesPendientes(resDon.data.filter(d => d.estado === 'PENDIENTE'));

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

  // ── Refrescar datos tras cambio ─────────────────────────────────────
  const refrescarDatos = async () => {
    if (!banco) return;
    const [resInv, resDon] = await Promise.all([
      inventarioService.listarPorBanco(banco.id),
      donacionService.listarPorBanco(banco.id),
    ]);
    setInventario(resInv.data);
    setDonacionesPendientes(resDon.data.filter(d => d.estado === 'PENDIENTE'));
    const hoy = new Date();
    const completadasMes = resDon.data.filter(d => {
      if (d.estado !== 'COMPLETADA') return false;
      const fecha = new Date(d.fechaDonacion);
      return fecha.getMonth() === hoy.getMonth() &&
             fecha.getFullYear() === hoy.getFullYear();
    });
    setDonacionesMes(completadasMes.length);
  };

  // ── Rechazar (directo, sin modal) ───────────────────────────────────
  const rechazarDonacion = async (donacionId) => {
    if (!confirm('¿Rechazar esta cita de donación?')) return;
    try {
      await donacionService.cambiarEstado(donacionId, 'RECHAZADA');
      await refrescarDatos();
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert('No se pudo rechazar la donación');
    }
  };

  // ── Abrir modal de completar ────────────────────────────────────────
  const abrirModalCompletar = (donacion) => {
    setDonacionActiva(donacion);
    setFormCompletar(FORM_COMPLETAR_VACIO);
    setErrorCompletar('');
    setModalCompletar(true);
  };

  // ── Confirmar completar donación con datos clínicos ─────────────────
  const confirmarCompletar = async () => {
    setErrorCompletar('');

    const unidades = Number(formCompletar.unidades);
    if (!unidades || unidades < 1) {
      setErrorCompletar('Ingresa al menos 1 unidad donada');
      return;
    }

    // El backend acepta entre 200 y 550 ml por donación
    // Convertimos unidades -> ml (1 unidad = 450 ml estándar)
    const cantidadMl = unidades * 450;
    if (cantidadMl < 200 || cantidadMl > 550) {
      setErrorCompletar('Por donación se permite 1 unidad (450 ml). Ajusta el valor.');
      return;
    }

    const hemoglobina = formCompletar.hemoglobina
      ? parseFloat(formCompletar.hemoglobina)
      : null;
    if (hemoglobina !== null && (hemoglobina < 7 || hemoglobina > 25)) {
      setErrorCompletar('La hemoglobina debe estar entre 7.0 y 25.0 g/dL');
      return;
    }

    setGuardandoCompletar(true);

    try {
      // 1. Actualizar donación con datos clínicos (PUT completo con todos los campos)
      const payloadPut = {
        usuarioId: donacionActiva.usuarioId,
        bancoId: donacionActiva.bancoId,
        solicitudId: donacionActiva.solicitudId || null,
        fechaDonacion: donacionActiva.fechaDonacion,
        tipoSangre: donacionActiva.tipoSangre,
        cantidadMl: cantidadMl,
        hemoglobina: hemoglobina,
        presionArterial: formCompletar.presionArterial || null,
        observaciones: formCompletar.observaciones || null,
        estado: 'PENDIENTE', // mantenemos pendiente aquí; el estado real lo cambiamos abajo
      };

      await donacionService.actualizar(donacionActiva.id, payloadPut);

      // 2. Cambiar estado a COMPLETADA (esto dispara update de inventario en el backend)
      await donacionService.cambiarEstado(donacionActiva.id, 'COMPLETADA');

      await refrescarDatos();
      setModalCompletar(false);
    } catch (err) {
      console.error('Error al completar:', err);
      const msg = err.response?.data?.mensaje ||
                  err.response?.data?.error ||
                  err.response?.data?.errores?.[Object.keys(err.response?.data?.errores || {})[0]] ||
                  'Error al completar la donación';
      setErrorCompletar(msg);
    } finally {
      setGuardandoCompletar(false);
    }
  };

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

      {/* Citas pendientes */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-[#e8e8f0]"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            📅 Citas de donación pendientes
          </h2>
          <span className="text-xs text-[#52526a]">
            {donacionesPendientes.length} pendiente{donacionesPendientes.length !== 1 ? 's' : ''}
          </span>
        </div>

        {donacionesPendientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-[#52526a] text-sm">No hay citas pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {donacionesPendientes.map(d => (
              <div key={d.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#08080f] border border-[#1e1e2e]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/30 flex items-center justify-center text-sm font-extrabold text-[#dc2626]"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    {d.usuarioNombre?.[0]}{d.usuarioApellido?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#e8e8f0]">
                      {d.usuarioNombre} {d.usuarioApellido}
                    </p>
                    <p className="text-xs text-[#52526a]">
                      🩸 {d.tipoSangre} · 📅 {new Date(d.fechaDonacion + 'T12:00:00').toLocaleDateString('es-CO', {
                        weekday: 'long', day: 'numeric', month: 'long'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalCompletar(d)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[rgba(67,233,123,0.1)] border border-[#43e97b]/30 text-[#43e97b] hover:bg-[rgba(67,233,123,0.2)] transition-all"
                  >
                    ✅ Completar
                  </button>
                  <button
                    onClick={() => rechazarDonacion(d.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50 transition-all"
                  >
                    ✕ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <div key={item.id}
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
            {solicitudes.map(s => (
              <div key={s.id}
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

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODAL: COMPLETAR DONACIÓN CON DATOS CLÍNICOS                   */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {modalCompletar && donacionActiva && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl max-w-lg w-full my-8">
            <div className="p-6 border-b border-[#1e1e2e] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#e8e8f0]"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                  ✅ Completar donación
                </h2>
                <p className="text-xs text-[#52526a] mt-1">
                  {donacionActiva.usuarioNombre} {donacionActiva.usuarioApellido} · {donacionActiva.tipoSangre}
                </p>
              </div>
              <button
                onClick={() => setModalCompletar(false)}
                className="text-[#52526a] hover:text-[#e8e8f0] text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errorCompletar && (
                <div className="px-4 py-3 rounded-lg text-sm bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] text-[#ff4d6d]">
                  ⚠️ {errorCompletar}
                </div>
              )}

              {/* Info del donante */}
              <div className="bg-[#08080f] border border-[#1e1e2e] rounded-xl p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#52526a] mb-2"
                   style={{ fontFamily: "'Syne', sans-serif" }}>
                  Datos de la cita
                </p>
                <p className="text-sm text-[#e8e8f0]">
                  🩸 <strong>{donacionActiva.tipoSangre}</strong> · 📅 {new Date(donacionActiva.fechaDonacion + 'T12:00:00').toLocaleDateString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>

              {/* Unidades donadas */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                       style={{ fontFamily: "'Syne', sans-serif" }}>
                  Unidades donadas *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1"
                  step="1"
                  value={formCompletar.unidades}
                  onChange={(e) => setFormCompletar({...formCompletar, unidades: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#43e97b]"
                />
                <p className="text-[0.7rem] text-[#52526a] mt-1">
                  Estándar: 1 unidad = 450 ml. Por regulación se permite 1 unidad por donación.
                </p>
              </div>

              {/* Hemoglobina */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                       style={{ fontFamily: "'Syne', sans-serif" }}>
                  Hemoglobina (g/dL) — opcional
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="7"
                  max="25"
                  value={formCompletar.hemoglobina}
                  onChange={(e) => setFormCompletar({...formCompletar, hemoglobina: e.target.value})}
                  placeholder="Ej: 14.5"
                  className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#43e97b] placeholder:text-[#2a2a3e]"
                />
              </div>

              {/* Presión arterial */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                       style={{ fontFamily: "'Syne', sans-serif" }}>
                  Presión arterial — opcional
                </label>
                <input
                  type="text"
                  value={formCompletar.presionArterial}
                  onChange={(e) => setFormCompletar({...formCompletar, presionArterial: e.target.value})}
                  placeholder="Ej: 120/80"
                  className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#43e97b] placeholder:text-[#2a2a3e]"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                       style={{ fontFamily: "'Syne', sans-serif" }}>
                  Observaciones — opcional
                </label>
                <textarea
                  rows="3"
                  value={formCompletar.observaciones}
                  onChange={(e) => setFormCompletar({...formCompletar, observaciones: e.target.value})}
                  placeholder="Notas del proceso, incidencias, etc."
                  className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#43e97b] placeholder:text-[#2a2a3e] resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#1e1e2e] flex justify-end gap-3">
              <button
                onClick={() => setModalCompletar(false)}
                disabled={guardandoCompletar}
                className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:text-[#e8e8f0] transition-all disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCompletar}
                disabled={guardandoCompletar}
                className="px-5 py-2.5 rounded-lg text-sm font-extrabold text-white bg-gradient-to-r from-[#43e97b] to-[#22c55e] shadow-lg shadow-[#43e97b]/30 hover:shadow-xl transition-all disabled:opacity-40"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {guardandoCompletar ? 'Guardando...' : '✅ CONFIRMAR DONACIÓN'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
} 