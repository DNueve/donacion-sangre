import { useState } from 'react';
import BloodTypeBadge from './BloodTypeBadge';
import UrgencyTag from './UrgencyTag';
import { useAuth } from '../../context/AuthContext';
import { donacionService } from '../../services/api';

export default function UrgenciaCard({ urgencia, onClick }) {
  const { user } = useAuth();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState('');

  const hoy = new Date().toISOString().split('T')[0];

  const abrirModal = () => {
    setFecha(hoy);
    setError('');
    setConfirmado(false);
    setModalAbierto(true);
  };

  const confirmarDonacion = async () => {
    if (!fecha) return;
    setGuardando(true);
    setError('');
    try {
      await donacionService.registrar({
        usuarioId: user.id,
        bancoId: urgencia.bancoId,
        solicitudId: urgencia.id,
        fechaDonacion: fecha,
        tipoSangre: user.tipoSangre,
        cantidadMl: 450,
      });
      setConfirmado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la donación');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-5 hover:border-[#dc2626]/30 transition-all hover:translate-x-1">
        <div className="flex items-center justify-between flex-wrap gap-4">

          <div className="flex items-center gap-4 flex-1">
            <BloodTypeBadge tipo={urgencia.tipoSangre} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-base text-[#e8e8f0]">{urgencia.banco}</h4>
                <UrgencyTag nivel={urgencia.urgencia} />
              </div>
              <div className="flex items-center gap-4 text-sm text-[#52526a] flex-wrap">
                <span>📍 {urgencia.distanciaKm} km</span>
                <span>🩸 {urgencia.unidades} unidades</span>
                {urgencia.fechaLimite && (
                  <span>📅 Hasta {new Date(urgencia.fechaLimite).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={abrirModal}
            className="bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#dc2626]/30 transition-all"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            QUIERO AYUDAR →
          </button>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm mx-4">

            {!confirmado ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-4xl mb-3">🩸</p>
                  <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-1"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    Confirmar donación
                  </h3>
                  <p className="text-sm text-[#52526a]">
                    Tu acto puede salvar hasta 3 vidas
                  </p>
                </div>

                {/* Info del banco */}
                <div className="bg-[#08080f] border border-[#1e1e2e] rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#52526a]">Banco</span>
                    <span className="text-sm font-bold text-[#e8e8f0]">{urgencia.banco}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#52526a]">Tipo requerido</span>
                    <BloodTypeBadge tipo={urgencia.tipoSangre} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#52526a]">Tu tipo</span>
                    <span className="text-sm font-bold text-[#e8e8f0]">{user?.tipoSangre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#52526a]">Unidades faltantes</span>
                    <span className="text-sm font-bold text-[#dc2626]">{urgencia.unidades}</span>
                  </div>
                </div>

                {/* Selector de fecha */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                    ¿Cuándo irás a donar?
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    min={hoy}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]
                      [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-[rgba(220,38,38,0.08)] border border-[#dc2626]/30 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-[#dc2626] font-bold">{error}</p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalAbierto(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#e8e8f0] bg-[#1e1e2e] hover:bg-[#2a2a3e] transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarDonacion}
                    disabled={!fecha || guardando}
                    className="flex-1 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] disabled:opacity-50 transition-all"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {guardando ? 'Registrando...' : '🩸 Confirmar'}
                  </button>
                </div>
              </>
            ) : (
              /* ── Estado confirmado ── */
              <>
                <div className="text-center py-4">
                  <p className="text-6xl mb-4">✅</p>
                  <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-2"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    ¡Gracias, {user?.nombre}!
                  </h3>
                  <p className="text-sm text-[#52526a] mb-2">
                    Tu cita fue registrada para el
                  </p>
                  <p className="text-lg font-bold text-[#dc2626] mb-4">
                    {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })}
                  </p>
                  <p className="text-sm text-[#52526a] mb-6">
                    Dirígete al banco <span className="text-[#e8e8f0] font-bold">{urgencia.banco}</span> en la fecha indicada. ¡Tu donación puede salvar hasta 3 vidas!
                  </p>
                  <button
                    onClick={() => setModalAbierto(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}