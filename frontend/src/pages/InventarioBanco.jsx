import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import { useAuth } from '../context/AuthContext';
import { bancoService, inventarioService } from '../services/api';

const TIPOS_SANGRE = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function InventarioBanco() {
  const { user } = useAuth();

  const [banco, setBanco] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Modal agregar/editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [form, setForm] = useState({
    tipoSangre: '',
    unidadesDisponibles: '',
    unidadesMinimas: 5,
  });

  // Modal ajuste rápido
  const [modalAjuste, setModalAjuste] = useState(false);
  const [itemAjuste, setItemAjuste] = useState(null);
  const [cantidadAjuste, setCantidadAjuste] = useState('');

  // ── Cargar banco e inventario ─────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const resBancos = await bancoService.listarActivos();
        const miBanco = resBancos.data.find(b => b.admin?.id === user?.id);
        if (!miBanco) { setLoading(false); return; }
        setBanco(miBanco);
        const resInv = await inventarioService.listarPorBanco(miBanco.id);
        setInventario(resInv.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) cargar();
  }, [user]);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // ── Tipos disponibles para agregar (los que no existen aún) ───────────────
  const tiposDisponibles = TIPOS_SANGRE.filter(
    t => !inventario.some(i => i.tipoSangre === t)
  );

  // ── Abrir modal crear ─────────────────────────────────────────────────────
  const abrirCrear = () => {
    setModoEdicion(false);
    setItemSeleccionado(null);
    setForm({ tipoSangre: tiposDisponibles[0] || '', unidadesDisponibles: '', unidadesMinimas: 5 });
    setModalAbierto(true);
  };

  // ── Abrir modal editar ────────────────────────────────────────────────────
  const abrirEditar = (item) => {
    setModoEdicion(true);
    setItemSeleccionado(item);
    setForm({
      tipoSangre: item.tipoSangre,
      unidadesDisponibles: item.unidadesDisponibles,
      unidadesMinimas: item.unidadesMinimas,
    });
    setModalAbierto(true);
  };

  // ── Guardar (crear o editar) ──────────────────────────────────────────────
  const guardar = async () => {
    if (!form.tipoSangre || form.unidadesDisponibles === '') return;
    setGuardando(true);
    try {
      if (modoEdicion) {
        await inventarioService.actualizar(itemSeleccionado.id, {
          bancoId: banco.id,
          tipoSangre: form.tipoSangre,
          unidadesDisponibles: Number(form.unidadesDisponibles),
          unidadesMinimas: Number(form.unidadesMinimas),
        });
        mostrarMensaje('Inventario actualizado correctamente');
      } else {
        await inventarioService.crear({
          bancoId: banco.id,
          tipoSangre: form.tipoSangre,
          unidadesDisponibles: Number(form.unidadesDisponibles),
          unidadesMinimas: Number(form.unidadesMinimas),
        });
        mostrarMensaje('Tipo de sangre agregado al inventario');
      }
      // Recargar inventario
      const resInv = await inventarioService.listarPorBanco(banco.id);
      setInventario(resInv.data);
      setModalAbierto(false);
    } catch (err) {
      mostrarMensaje(err.response?.data?.mensaje || 'Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ── Ajuste rápido de unidades ─────────────────────────────────────────────
  const abrirAjuste = (item) => {
    setItemAjuste(item);
    setCantidadAjuste('');
    setModalAjuste(true);
  };

  const aplicarAjuste = async (signo) => {
    if (!cantidadAjuste || isNaN(cantidadAjuste)) return;
    setGuardando(true);
    try {
      const cantidad = signo * Number(cantidadAjuste);
      await inventarioService.ajustarUnidades(banco.id, itemAjuste.tipoSangre, cantidad);
      const resInv = await inventarioService.listarPorBanco(banco.id);
      setInventario(resInv.data);
      setModalAjuste(false);
      mostrarMensaje(`${signo > 0 ? '+' : '-'}${cantidadAjuste} unidades de ${itemAjuste.tipoSangre}`);
    } catch (err) {
      mostrarMensaje(err.response?.data?.mensaje || 'Error al ajustar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const totalUnidades = inventario.reduce((acc, i) => acc + i.unidadesDisponibles, 0);
  const bajoStock = inventario.filter(i => i.bajoStock);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#1e1e2e] rounded-2xl animate-pulse" />)}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* Mensaje flash */}
      {mensaje && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
          mensaje.tipo === 'error'
            ? 'bg-[#dc2626] text-white'
            : 'bg-[#43e97b] text-[#08080f]'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {banco?.nombre}
          </p>
          <h1 className="text-4xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
            🩸 Inventario
          </h1>
          <p className="text-[#52526a] mt-1">
            {totalUnidades} unidades totales · {bajoStock.length > 0 ? `⚠️ ${bajoStock.length} tipo${bajoStock.length > 1 ? 's' : ''} bajo mínimo` : '✅ Stock saludable'}
          </p>
        </div>
        {tiposDisponibles.length > 0 && (
          <button
            onClick={abrirCrear}
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            + Agregar tipo
          </button>
        )}
      </div>

      {/* Alerta bajo stock */}
      {bajoStock.length > 0 && (
        <div className="bg-[rgba(220,38,38,0.08)] border border-[#dc2626]/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-[#dc2626]">Stock bajo en {bajoStock.length} tipo{bajoStock.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-[#52526a] mt-0.5">
              {bajoStock.map(i => `${i.tipoSangre} (${i.unidadesDisponibles}/${i.unidadesMinimas})`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Grid inventario */}
      {inventario.length === 0 ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🩸</p>
          <p className="text-[#e8e8f0] font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Sin inventario registrado
          </p>
          <p className="text-[#52526a] text-sm mb-6">Agrega los tipos de sangre disponibles en tu banco</p>
          <button
            onClick={abrirCrear}
            className="px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            + Agregar primer tipo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {inventario.map(item => (
            <div
              key={item.id}
              className={`bg-[#111118] border rounded-2xl p-5 flex flex-col items-center gap-3 transition-all hover:border-[#dc2626]/30 ${
                item.bajoStock ? 'border-[#dc2626]/40' : 'border-[#1e1e2e]'
              }`}
            >
              <BloodTypeBadge tipo={item.tipoSangre} />

              <div className="text-center">
                <p className={`text-4xl font-extrabold ${item.bajoStock ? 'text-[#dc2626]' : 'text-[#e8e8f0]'}`}
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                  {item.unidadesDisponibles}
                </p>
                <p className="text-xs text-[#52526a]">unidades</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-[#52526a]">
                  Mínimo: <span className="text-[#e8e8f0] font-bold">{item.unidadesMinimas}</span>
                </p>
                {item.bajoStock && (
                  <span className="text-xs text-[#dc2626] font-bold">⚠️ Bajo mínimo</span>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 w-full mt-1">
                <button
                  onClick={() => abrirAjuste(item)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#e8e8f0] hover:border-[#dc2626]/50 transition-all"
                >
                  ± Ajustar
                </button>
                <button
                  onClick={() => abrirEditar(item)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:border-[#dc2626]/50 hover:text-[#e8e8f0] transition-all"
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal crear/editar ──────────────────────────────────────────────── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              {modoEdicion ? 'Editar inventario' : 'Agregar tipo de sangre'}
            </h3>

            <div className="space-y-4">
              {/* Tipo de sangre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Tipo de sangre
                </label>
                {modoEdicion ? (
                  <div className="px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm font-bold">
                    {form.tipoSangre}
                  </div>
                ) : (
                  <select
                    value={form.tipoSangre}
                    onChange={e => setForm({ ...form, tipoSangre: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                  >
                    {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </div>

              {/* Unidades disponibles */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Unidades disponibles
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.unidadesDisponibles}
                  onChange={e => setForm({ ...form, unidadesDisponibles: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                />
              </div>

              {/* Unidades mínimas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                  Mínimo de alerta
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.unidadesMinimas}
                  onChange={e => setForm({ ...form, unidadesMinimas: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626]"
                />
                <p className="text-xs text-[#52526a] mt-1">Se alertará cuando el stock baje de este número</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#e8e8f0] bg-[#1e1e2e] hover:bg-[#2a2a3e] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] disabled:opacity-50 transition-all"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal ajuste rápido ─────────────────────────────────────────────── */}
      {modalAjuste && itemAjuste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-extrabold text-[#e8e8f0] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Ajustar {itemAjuste.tipoSangre}
            </h3>
            <p className="text-sm text-[#52526a] mb-6">
              Stock actual: <span className="text-[#e8e8f0] font-bold">{itemAjuste.unidadesDisponibles} unidades</span>
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#52526a] mb-1.5">
                Cantidad a mover
              </label>
              <input
                type="number"
                min="1"
                value={cantidadAjuste}
                onChange={e => setCantidadAjuste(e.target.value)}
                placeholder="Ej: 5"
                className="w-full px-4 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-xl text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] mb-4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalAjuste(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[#e8e8f0] bg-[#1e1e2e]"
              >
                Cancelar
              </button>
              <button
                onClick={() => aplicarAjuste(-1)}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl text-sm font-extrabold text-white bg-[#991b1b] disabled:opacity-50"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                − Salida
              </button>
              <button
                onClick={() => aplicarAjuste(1)}
                disabled={guardando}
                className="flex-1 py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] disabled:opacity-50"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                + Entrada
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}