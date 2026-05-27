import { useState } from 'react';
import BloodTypeBadge from './BloodTypeBadge';
import UrgencyTag from './UrgencyTag';
import { useAuth } from '../../context/AuthContext';
import { donacionService } from '../../services/api';

const PASO = {
  VERIFICANDO: 'VERIFICANDO',
  NO_PUEDE:    'NO_PUEDE',
  TRIAGE:      'TRIAGE',
  FECHA:       'FECHA',
  CONFIRMADO:  'CONFIRMADO',
};

const SYSTEM_PROMPT = (nombre) => `Eres DonaBot, un asistente médico virtual de DonaVida especializado en triage para donación de sangre.
Tu rol es determinar si ${nombre} está apto para donar sangre hoy.

Debes hacer EXACTAMENTE 4 preguntas, una por una, esperando la respuesta antes de continuar:
1. ¿Has tenido fiebre, gripa o alguna enfermedad en los últimos 7 días?
2. ¿Tomaste algún medicamento en las últimas 24 horas? (aspirina, antibióticos, etc.)
3. ¿Dormiste al menos 6 horas anoche y comiste algo hoy?
4. ¿Te sientes bien en este momento, sin mareos ni cansancio extremo?

Después de las 4 respuestas, da un veredicto final así:
- Si es APTO escribe exactamente: "✅ APTO: [razón breve]"
- Si NO es apto escribe exactamente: "❌ NO APTO: [razón breve y cuándo volver]"

Sé amigable, breve y habla en español colombiano informal. Máximo 2 líneas por respuesta.`;

export default function UrgenciaCard({ urgencia }) {
  const { user } = useAuth();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [paso, setPaso] = useState(PASO.VERIFICANDO);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [fecha, setFecha] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const [mensajes, setMensajes] = useState([]);
  const [inputUsuario, setInputUsuario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [triageCompletado, setTriageCompletado] = useState(false);
  const [esApto, setEsApto] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];

  // ── Llamar a Groq vía proxy backend ──────────────────────────────────────
  const llamarGroq = async (historial) => {
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/claude/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT(user?.nombre) },
          ...historial,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  };

  // ── Paso 1: verificar 90 días ─────────────────────────────────────────────
  const abrirModal = async () => {
    setError('');
    setMensajes([]);
    setInputUsuario('');
    setTriageCompletado(false);
    setEsApto(false);
    setPaso(PASO.VERIFICANDO);
    setModalAbierto(true);

    try {
      const res = await donacionService.historialUsuario(user.id);
      const completadas = res.data.filter(d => d.estado === 'COMPLETADA');

      if (completadas.length > 0) {
        const ultima = new Date(completadas[0].fechaDonacion);
        const hoyDate = new Date();
        const dias = Math.floor((hoyDate - ultima) / (1000 * 60 * 60 * 24));
        if (dias < 90) {
          setDiasRestantes(90 - dias);
          setPaso(PASO.NO_PUEDE);
          return;
        }
      }

      await iniciarTriage();
    } catch (err) {
      console.error(err);
      await iniciarTriage();
    }
  };

  // ── Paso 2: iniciar triage ────────────────────────────────────────────────
  const iniciarTriage = async () => {
    setPaso(PASO.TRIAGE);
    setEnviando(true);
    try {
      const respuesta = await llamarGroq([
        { role: 'user', content: 'Hola, quiero donar sangre' },
      ]);
      setMensajes([
        { rol: 'usuario', texto: 'Hola, quiero donar sangre' },
        { rol: 'bot', texto: respuesta },
      ]);
    } catch (err) {
      console.error(err);
      setPaso(PASO.FECHA);
      setFecha(hoy);
    } finally {
      setEnviando(false);
    }
  };

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const enviarMensaje = async () => {
    if (!inputUsuario.trim() || enviando) return;
    setEnviando(true);

    const nuevosMensajes = [...mensajes, { rol: 'usuario', texto: inputUsuario }];
    setMensajes(nuevosMensajes);
    setInputUsuario('');

    const historial = nuevosMensajes.map(m => ({
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.texto,
    }));

    try {
      const respuesta = await llamarGroq(historial);
      const mensajesActualizados = [...nuevosMensajes, { rol: 'bot', texto: respuesta }];
      setMensajes(mensajesActualizados);

      if (respuesta.includes('✅ APTO')) {
        setTriageCompletado(true);
        setEsApto(true);
      } else if (respuesta.includes('❌ NO APTO')) {
        setTriageCompletado(true);
        setEsApto(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  // ── Confirmar donación ────────────────────────────────────────────────────
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
      setPaso(PASO.CONFIRMADO);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la donación');
    } finally {
      setGuardando(false);
    }
  };

  const cerrar = () => {
    setModalAbierto(false);
    setPaso(PASO.VERIFICANDO);
  };

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
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

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl w-full max-w-sm mx-4 overflow-hidden">

            {/* ── VERIFICANDO ── */}
            {paso === PASO.VERIFICANDO && (
              <div className="p-6 text-center">
                <div className="w-10 h-10 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#52526a]">Verificando tu historial...</p>
              </div>
            )}

            {/* ── NO PUEDE DONAR ── */}
            {paso === PASO.NO_PUEDE && (
              <div className="p-6 text-center">
                <p className="text-5xl mb-4">⏳</p>
                <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  Todavía no puedes donar
                </h3>
                <p className="text-sm text-[#52526a] mb-2">
                  Tu última donación fue hace menos de 90 días.
                </p>
                <p className="text-3xl font-extrabold text-[#dc2626] mb-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {diasRestantes} días
                </p>
                <p className="text-xs text-[#52526a] mb-6">para poder donar de nuevo</p>
                <button
                  onClick={cerrar}
                  className="w-full py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Entendido
                </button>
              </div>
            )}

            {/* ── TRIAGE ── */}
            {paso === PASO.TRIAGE && (
              <div className="flex flex-col" style={{ height: '480px' }}>

                <div className="p-4 border-b border-[#1e1e2e] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#e8e8f0]">DonaBot</p>
                    <p className="text-xs text-[#52526a]">Triage virtual · powered by Groq</p>
                  </div>
                  <button onClick={cerrar} className="ml-auto text-[#52526a] hover:text-[#e8e8f0]">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {mensajes.map((m, i) => (
                    <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        m.rol === 'usuario'
                          ? 'bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white rounded-br-none'
                          : 'bg-[#1e1e2e] text-[#e8e8f0] rounded-bl-none'
                      }`}>
                        {m.texto}
                      </div>
                    </div>
                  ))}
                  {enviando && (
                    <div className="flex justify-start">
                      <div className="bg-[#1e1e2e] px-4 py-3 rounded-xl rounded-bl-none">
                        <div className="flex gap-1">
                          {[0,1,2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-[#52526a] rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!triageCompletado ? (
                  <div className="p-4 border-t border-[#1e1e2e] flex gap-2">
                    <input
                      type="text"
                      value={inputUsuario}
                      onChange={e => setInputUsuario(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                      placeholder="Escribe tu respuesta..."
                      disabled={enviando}
                      className="flex-1 px-3 py-2 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] disabled:opacity-50"
                    />
                    <button
                      onClick={enviarMensaje}
                      disabled={!inputUsuario.trim() || enviando}
                      className="px-4 py-2 bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white rounded-xl text-sm font-bold disabled:opacity-50"
                    >
                      →
                    </button>
                  </div>
                ) : (
                  <div className="p-4 border-t border-[#1e1e2e]">
                    {esApto ? (
                      <button
                        onClick={() => { setPaso(PASO.FECHA); setFecha(hoy); }}
                        className="w-full py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c]"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        🩸 Continuar → Agendar fecha
                      </button>
                    ) : (
                      <button
                        onClick={cerrar}
                        className="w-full py-2.5 rounded-xl text-[#e8e8f0] bg-[#1e1e2e] text-sm font-bold"
                      >
                        Entendido, cerrar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── FECHA ── */}
            {paso === PASO.FECHA && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-4xl mb-3">🩸</p>
                  <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-1"
                    style={{ fontFamily: "'Syne', sans-serif" }}>
                    Confirmar donación
                  </h3>
                  <p className="text-sm text-[#52526a]">Tu acto puede salvar hasta 3 vidas</p>
                </div>

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

                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                    ¿Cuándo irás a donar?
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    min={hoy}
                    onChange={e => setFecha(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {error && (
                  <div className="bg-[rgba(220,38,38,0.08)] border border-[#dc2626]/30 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-[#dc2626] font-bold">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={cerrar}
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
              </div>
            )}

            {/* ── CONFIRMADO ── */}
            {paso === PASO.CONFIRMADO && (
              <div className="p-6 text-center">
                <p className="text-6xl mb-4">✅</p>
                <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-2"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  ¡Gracias, {user?.nombre}!
                </h3>
                <p className="text-sm text-[#52526a] mb-2">Tu cita fue registrada para el</p>
                <p className="text-lg font-bold text-[#dc2626] mb-4">
                  {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'long'
                  })}
                </p>
                <p className="text-sm text-[#52526a] mb-6">
                  Dirígete al banco <span className="text-[#e8e8f0] font-bold">{urgencia.banco}</span> en la fecha indicada. ¡Tu donación puede salvar hasta 3 vidas!
                </p>
                <button
                  onClick={cerrar}
                  className="w-full py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Cerrar
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}