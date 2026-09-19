import { useState } from 'react';
import * as XLSX from 'xlsx';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '../components/layout/Layout';
import { donacionService, inventarioService, bancoService } from '../services/api';

registerLocale('es', es);

const TIPOS_REPORTE = [
  {
    id: 'DONACIONES',
    titulo: 'Reporte de Donaciones',
    descripcion: 'Historial global de donaciones registradas por banco, donante, tipo de sangre y estado.',
    icono: '🩸',
    color: 'from-[#dc2626] to-[#991b1b]',
    filtraFecha: true,
    campoFecha: 'fechaDonacion',
    labelFecha: 'Filtra por fecha de donación',
  },
  {
    id: 'INVENTARIO',
    titulo: 'Reporte de Inventario',
    descripcion: 'Estado actual del stock por banco y tipo de sangre, con alertas de nivel crítico.',
    icono: '📦',
    color: 'from-[#f59e0b] to-[#b45309]',
    filtraFecha: true,
    campoFecha: 'updatedAt',
    labelFecha: 'Filtra por fecha de última actualización del stock',
  },
];

export default function Reportes() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('DONACIONES');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [datos, setDatos] = useState([]);
  const [generado, setGenerado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const tipoActual = TIPOS_REPORTE.find(t => t.id === tipoSeleccionado);

  // ── Helper: convertir un valor de fecha (string ISO o Date) a YYYY-MM-DD
  const fechaAYMD = (v) => {
    if (!v) return null;
    if (typeof v === 'string') {
      // Si viene como "2026-09-18T22:12:27.979Z" o "2026-09-18"
      return v.slice(0, 10);
    }
    return toYMD(new Date(v));
  };

  // ── Generar preview ───────────────────────────────────────────────────
  const generar = async () => {
    setError('');
    setGenerando(true);
    setDatos([]);
    setGenerado(false);

    try {
      if (tipoSeleccionado === 'DONACIONES') {
        const bancosRes = await bancoService.listarTodos();
        const bancos = bancosRes.data;

        const promesas = bancos.map(b =>
          donacionService.listarPorBanco(b.id).catch(() => ({ data: [] }))
        );
        const resultados = await Promise.all(promesas);
        let todas = resultados.flatMap(r => r.data);

        // Filtro por rango de fecha (fechaDonacion)
        if (fechaDesde) {
          todas = todas.filter(d => (fechaAYMD(d.fechaDonacion) || '') >= fechaDesde);
        }
        if (fechaHasta) {
          todas = todas.filter(d => (fechaAYMD(d.fechaDonacion) || '') <= fechaHasta);
        }

        // Ordenar por fecha descendente
        todas.sort((a, b) => (b.fechaDonacion || '').localeCompare(a.fechaDonacion || ''));
        setDatos(todas);

      } else if (tipoSeleccionado === 'INVENTARIO') {
        const bancosRes = await bancoService.listarTodos();
        const bancos = bancosRes.data;

        const promesas = bancos.map(b =>
          inventarioService.listarPorBanco(b.id).catch(() => ({ data: [] }))
        );
        const resultados = await Promise.all(promesas);
        let todo = resultados.flatMap(r => r.data);

        // Filtro por rango de fecha (updatedAt)
        if (fechaDesde) {
          todo = todo.filter(d => (fechaAYMD(d.updatedAt) || '') >= fechaDesde);
        }
        if (fechaHasta) {
          todo = todo.filter(d => (fechaAYMD(d.updatedAt) || '') <= fechaHasta);
        }

        // Ordenar: bajo stock primero, luego por banco y tipo
        todo.sort((a, b) => {
          if (a.bajoStock !== b.bajoStock) return b.bajoStock ? 1 : -1;
          if (a.bancoNombre !== b.bancoNombre) return (a.bancoNombre || '').localeCompare(b.bancoNombre || '');
          return (a.tipoSangre || '').localeCompare(b.tipoSangre || '');
        });
        setDatos(todo);
      }

      setGenerado(true);
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError('Error al generar el reporte. Revisa la conexión con el servidor.');
    } finally {
      setGenerando(false);
    }
  };

  // ── Descargar Excel ──────────────────────────────────────────────────
  const descargarExcel = () => {
    if (datos.length === 0) return;

    let filas = [];
    let nombreHoja = '';
    let nombreArchivo = '';

    if (tipoSeleccionado === 'DONACIONES') {
      filas = datos.map(d => ({
        'ID': d.id,
        'Fecha donación': d.fechaDonacion || '',
        'Donante': `${d.usuarioNombre || ''} ${d.usuarioApellido || ''}`.trim(),
        'Tipo sangre': d.tipoSangre || d.usuarioTipoSangre || '',
        'Banco': d.bancoNombre || '',
        'Cantidad (ml)': d.cantidadMl ?? 0,
        'Hemoglobina (g/dL)': d.hemoglobina ?? '',
        'Presión arterial': d.presionArterial || '',
        'Estado': d.estado || '',
        'Observaciones': d.observaciones || '',
        'ID Solicitud': d.solicitudId || '—',
      }));
      nombreHoja = 'Donaciones';
      const rango = fechaDesde || fechaHasta
        ? `_${fechaDesde || 'inicio'}_a_${fechaHasta || 'hoy'}`
        : '';
      nombreArchivo = `donavida_donaciones${rango}_${hoyStr()}.xlsx`;
    } else {
      filas = datos.map(d => ({
        'Banco': d.bancoNombre || '',
        'Ciudad': d.bancoCiudad || '',
        'Tipo sangre': d.tipoSangre || '',
        'Unidades disponibles': d.unidadesDisponibles ?? 0,
        'Unidades mínimas': d.unidadesMinimas ?? 0,
        'Diferencia': (d.unidadesDisponibles ?? 0) - (d.unidadesMinimas ?? 0),
        'Bajo stock': d.bajoStock ? 'SI' : 'NO',
        'Última actualización': d.updatedAt ? new Date(d.updatedAt).toLocaleString('es-CO') : '',
      }));
      nombreHoja = 'Inventario';
      const rango = fechaDesde || fechaHasta
        ? `_${fechaDesde || 'inicio'}_a_${fechaHasta || 'hoy'}`
        : '';
      nombreArchivo = `donavida_inventario${rango}_${hoyStr()}.xlsx`;
    }

    const ws = XLSX.utils.json_to_sheet(filas);

    // Ajuste automático del ancho de columnas
    const anchos = Object.keys(filas[0] || {}).map(k => ({
      wch: Math.max(k.length, ...filas.map(f => String(f[k] ?? '').length)) + 2
    }));
    ws['!cols'] = anchos;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    XLSX.writeFile(wb, nombreArchivo);
  };

  // ── KPIs de resumen ──────────────────────────────────────────────────
  const kpis = () => {
    if (tipoSeleccionado === 'DONACIONES') {
      const total = datos.length;
      const completadas = datos.filter(d => d.estado === 'COMPLETADA').length;
      const pendientes = datos.filter(d => d.estado === 'PENDIENTE').length;
      const mlTotales = datos
        .filter(d => d.estado === 'COMPLETADA')
        .reduce((s, d) => s + (d.cantidadMl || 0), 0);
      return [
        { label: 'Total', valor: total, color: 'text-[#e8e8f0]' },
        { label: 'Completadas', valor: completadas, color: 'text-[#43e97b]' },
        { label: 'Pendientes', valor: pendientes, color: 'text-[#f59e0b]' },
        { label: 'ml recolectados', valor: mlTotales, color: 'text-[#dc2626]' },
      ];
    }
    // INVENTARIO
    const total = datos.length;
    const criticos = datos.filter(d => d.bajoStock).length;
    const unidadesTotales = datos.reduce((s, d) => s + (d.unidadesDisponibles || 0), 0);
    const bancos = new Set(datos.map(d => d.bancoNombre)).size;
    return [
      { label: 'Registros', valor: total, color: 'text-[#e8e8f0]' },
      { label: 'Tipos bajo stock', valor: criticos, color: criticos > 0 ? 'text-[#ff4d6d]' : 'text-[#43e97b]' },
      { label: 'Unidades totales', valor: unidadesTotales, color: 'text-[#e8e8f0]' },
      { label: 'Bancos cubiertos', valor: bancos, color: 'text-[#e8e8f0]' },
    ];
  };

  // ── Presets de rango de fechas ───────────────────────────────────────
  const PRESETS = [
    { label: 'Hoy', getFechas: () => {
        const h = new Date();
        return { desde: h, hasta: h };
      }
    },
    { label: 'Últimos 7 días', getFechas: () => {
        const h = new Date();
        const d = new Date(); d.setDate(d.getDate() - 6);
        return { desde: d, hasta: h };
      }
    },
    { label: 'Últimos 30 días', getFechas: () => {
        const h = new Date();
        const d = new Date(); d.setDate(d.getDate() - 29);
        return { desde: d, hasta: h };
      }
    },
    { label: 'Este mes', getFechas: () => {
        const h = new Date();
        const d = new Date(h.getFullYear(), h.getMonth(), 1);
        return { desde: d, hasta: h };
      }
    },
    { label: 'Este año', getFechas: () => {
        const h = new Date();
        const d = new Date(h.getFullYear(), 0, 1);
        return { desde: d, hasta: h };
      }
    },
    { label: 'Todo', getFechas: () => ({ desde: null, hasta: null }) },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-1"
           style={{ fontFamily: "'Syne', sans-serif" }}>
          Reportes · Super Admin
        </p>
        <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          Centro de Reportes
        </h1>
        <p className="text-[#52526a]">
          Selecciona el tipo de reporte, aplica filtros y descárgalo en formato Excel.
        </p>
      </div>

      {/* Selector de reporte */}
      <div className="mb-6">
        <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#52526a] mb-3"
               style={{ fontFamily: "'Syne', sans-serif" }}>
          1 · Tipo de reporte
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIPOS_REPORTE.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTipoSeleccionado(t.id);
                setGenerado(false);
                setDatos([]);
              }}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                tipoSeleccionado === t.id
                  ? 'border-[#dc2626] bg-[rgba(220,38,38,0.05)]'
                  : 'border-[#1e1e2e] bg-[#111118] hover:border-[#dc2626]/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-3xl`}>
                  {t.icono}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-[#e8e8f0] mb-0.5"
                      style={{ fontFamily: "'Syne', sans-serif" }}>
                    {t.titulo}
                  </h3>
                  <p className="text-xs text-[#52526a] leading-snug">
                    {t.descripcion}
                  </p>
                </div>
                {tipoSeleccionado === t.id && (
                  <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    ✓
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros con calendario */}
      <div className="mb-6">
        <label className="block text-[0.7rem] font-bold uppercase tracking-wider text-[#52526a] mb-3"
               style={{ fontFamily: "'Syne', sans-serif" }}>
          2 · Filtros
        </label>
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-5">

          {/* Hint del campo que se está filtrando */}
          <p className="text-[0.7rem] text-[#52526a] mb-3 italic">
            ℹ️ {tipoActual.labelFecha}
          </p>

          {/* Presets rápidos */}
          <div className="mb-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-2"
               style={{ fontFamily: "'Syne', sans-serif" }}>
              Rango rápido
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const { desde, hasta } = preset.getFechas();
                    setFechaDesde(desde ? toYMD(desde) : '');
                    setFechaHasta(hasta ? toYMD(hasta) : '');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#08080f] border border-[#1e1e2e] text-[#52526a] hover:text-[#e8e8f0] hover:border-[#dc2626]/50 transition-all"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rango con calendario visual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                     style={{ fontFamily: "'Syne', sans-serif" }}>
                📅 Fecha desde
              </label>
              <DatePicker
                selected={fechaDesde ? fromYMD(fechaDesde) : null}
                onChange={(d) => setFechaDesde(d ? toYMD(d) : '')}
                selectsStart
                startDate={fechaDesde ? fromYMD(fechaDesde) : null}
                endDate={fechaHasta ? fromYMD(fechaHasta) : null}
                maxDate={new Date()}
                minDate={new Date('2024-01-01')}
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona fecha desde"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] placeholder:text-[#2a2a3e] cursor-pointer"
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <label className="block text-[0.68rem] font-bold uppercase tracking-[1px] text-[#52526a] mb-1.5"
                     style={{ fontFamily: "'Syne', sans-serif" }}>
                📅 Fecha hasta
              </label>
              <DatePicker
                selected={fechaHasta ? fromYMD(fechaHasta) : null}
                onChange={(d) => setFechaHasta(d ? toYMD(d) : '')}
                selectsEnd
                startDate={fechaDesde ? fromYMD(fechaDesde) : null}
                endDate={fechaHasta ? fromYMD(fechaHasta) : null}
                minDate={fechaDesde ? fromYMD(fechaDesde) : new Date('2024-01-01')}
                maxDate={new Date()}
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona fecha hasta"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable
                className="w-full px-3 py-2.5 bg-[#08080f] border border-[#1e1e2e] rounded-lg text-[#e8e8f0] text-sm outline-none focus:border-[#dc2626] placeholder:text-[#2a2a3e] cursor-pointer"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          {/* Resumen del rango activo */}
          {(fechaDesde || fechaHasta) && (
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <p className="text-[0.7rem] text-[#43e97b] font-bold"
                 style={{ fontFamily: "'Syne', sans-serif" }}>
                ● Filtrando: {fechaDesde ? formatoFecha(fechaDesde) : 'inicio'} → {fechaHasta ? formatoFecha(fechaHasta) : 'hoy'}
              </p>
              <button
                onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                className="text-xs text-[#dc2626] hover:text-[#ff4d6d] font-bold"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                LIMPIAR FILTROS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={generar}
          disabled={generando}
          className="px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#dc2626] to-[#b91c1c] shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {generando ? '⏳ GENERANDO...' : '📊 GENERAR REPORTE'}
        </button>
        {generado && datos.length > 0 && (
          <button
            onClick={descargarExcel}
            className="px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#43e97b] to-[#22c55e] shadow-lg shadow-[#43e97b]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            ⬇ DESCARGAR EXCEL
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm bg-[rgba(255,77,109,0.08)] border border-[rgba(255,77,109,0.25)] text-[#ff4d6d] mb-6">
          ⚠️ {error}
        </div>
      )}

      {/* Preview del reporte */}
      {generado && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {kpis().map(k => (
              <div key={k.label} className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#52526a] mb-1"
                   style={{ fontFamily: "'Syne', sans-serif" }}>
                  {k.label}
                </p>
                <p className={`text-3xl font-extrabold ${k.color}`}
                   style={{ fontFamily: "'Syne', sans-serif" }}>
                  {k.valor}
                </p>
              </div>
            ))}
          </div>

          {/* Tabla preview */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#e8e8f0]"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                🔍 Vista previa · {datos.length} registro{datos.length !== 1 ? 's' : ''}
              </h3>
              {datos.length > 100 && (
                <span className="text-xs text-[#52526a] italic">
                  Mostrando primeros 100 · Excel incluye todos
                </span>
              )}
            </div>

            {datos.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-[#e8e8f0] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Sin registros
                </p>
                <p className="text-[#52526a] text-sm mt-1">
                  No hay datos que coincidan con los filtros aplicados.
                </p>
              </div>
            ) : tipoSeleccionado === 'DONACIONES' ? (
              <TablaDonaciones datos={datos.slice(0, 100)} />
            ) : (
              <TablaInventario datos={datos.slice(0, 100)} />
            )}
          </div>
        </>
      )}

      {/* Estado inicial */}
      {!generado && !generando && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-[#e8e8f0] font-bold text-lg mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Configura y genera tu reporte
          </p>
          <p className="text-[#52526a] text-sm max-w-md mx-auto">
            Elige el tipo de reporte arriba, ajusta los filtros y haz click en <strong className="text-[#dc2626]">GENERAR REPORTE</strong> para ver la vista previa antes de descargar el Excel.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* Estilos DARK MODE del DatePicker                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; }
        .react-datepicker-popper { z-index: 60 !important; }
        .react-datepicker {
          background: #111118 !important;
          border: 1px solid #1e1e2e !important;
          color: #e8e8f0 !important;
          font-family: 'DM Sans', sans-serif !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
        }
        .react-datepicker__header {
          background: #08080f !important;
          border-bottom: 1px solid #1e1e2e !important;
        }
        .react-datepicker__current-month,
        .react-datepicker-time__header,
        .react-datepicker-year-header {
          color: #e8e8f0 !important;
          font-family: 'Syne', sans-serif !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day-name,
        .react-datepicker__day,
        .react-datepicker__time-name { color: #e8e8f0 !important; }
        .react-datepicker__day:hover {
          background: #dc2626 !important;
          color: white !important;
          border-radius: 6px !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-selecting-range,
        .react-datepicker__day--in-range {
          background: #dc2626 !important;
          color: white !important;
          border-radius: 6px !important;
        }
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background: #dc2626 !important;
          color: white !important;
          border-radius: 6px !important;
        }
        .react-datepicker__day--keyboard-selected {
          background: rgba(220,38,38,0.3) !important;
          color: #e8e8f0 !important;
          border-radius: 6px !important;
        }
        .react-datepicker__day--disabled,
        .react-datepicker__day--outside-month { color: #2a2a3e !important; }
        .react-datepicker__navigation-icon::before { border-color: #52526a !important; }
        .react-datepicker__navigation:hover *::before { border-color: #dc2626 !important; }
        .react-datepicker__triangle { display: none !important; }
        .react-datepicker__month-select,
        .react-datepicker__year-select {
          background: #08080f !important;
          color: #e8e8f0 !important;
          border: 1px solid #1e1e2e !important;
          padding: 4px !important;
          border-radius: 4px !important;
        }
        .react-datepicker__close-icon::after {
          background: #dc2626 !important;
          color: white !important;
          font-size: 14px !important;
        }
      `}</style>
    </Layout>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────
function hoyStr() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

function toYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fromYMD(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatoFecha(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Sub-tablas ────────────────────────────────────────────────────────
function TablaDonaciones({ datos }) {
  const colorEstado = {
    COMPLETADA: 'text-[#43e97b] bg-[rgba(67,233,123,0.1)] border-[#43e97b]/30',
    PENDIENTE:  'text-[#f59e0b] bg-[rgba(245,158,11,0.1)] border-[#f59e0b]/30',
    RECHAZADA:  'text-[#ff4d6d] bg-[rgba(255,77,109,0.1)] border-[#ff4d6d]/30',
    CANCELADA:  'text-[#52526a] bg-[#08080f] border-[#1e1e2e]',
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#08080f] border-b border-[#1e1e2e]">
          <tr>
            {['Fecha', 'Donante', 'Tipo', 'Banco', 'Cantidad', 'Estado'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[#52526a]"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map(d => (
            <tr key={d.id} className="border-b border-[#1e1e2e] hover:bg-[#08080f]/50 transition-colors">
              <td className="px-4 py-3 text-[#e8e8f0]">{d.fechaDonacion || '—'}</td>
              <td className="px-4 py-3">
                <p className="text-[#e8e8f0]">{d.usuarioNombre} {d.usuarioApellido}</p>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-[#dc2626] bg-[rgba(220,38,38,0.1)] border border-[#dc2626]/30 px-2 py-1 rounded-full">
                  {d.tipoSangre || d.usuarioTipoSangre || '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-[#e8e8f0]">{d.bancoNombre || '—'}</td>
              <td className="px-4 py-3">
                {d.cantidadMl ? (
                  <span className="text-[#e8e8f0] font-bold">
                    {d.cantidadMl} <span className="text-xs text-[#52526a] font-normal">ml</span>
                  </span>
                ) : (
                  <span className="text-[#52526a]">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`text-[0.65rem] font-bold px-2 py-1 rounded-full border ${colorEstado[d.estado] || 'text-[#52526a] bg-[#08080f] border-[#1e1e2e]'}`}>
                  {d.estado || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaInventario({ datos }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#08080f] border-b border-[#1e1e2e]">
          <tr>
            {['Banco', 'Ciudad', 'Tipo', 'Disponibles', 'Mínimo', 'Actualizado', 'Estado'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-[#52526a]"
                  style={{ fontFamily: "'Syne', sans-serif" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map(d => (
            <tr key={d.id} className={`border-b border-[#1e1e2e] hover:bg-[#08080f]/50 transition-colors ${d.bajoStock ? 'bg-[rgba(255,77,109,0.03)]' : ''}`}>
              <td className="px-4 py-3 text-[#e8e8f0]">{d.bancoNombre || '—'}</td>
              <td className="px-4 py-3 text-[#52526a]">{d.bancoCiudad || '—'}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-[#dc2626] bg-[rgba(220,38,38,0.1)] border border-[#dc2626]/30 px-2 py-1 rounded-full">
                  {d.tipoSangre}
                </span>
              </td>
              <td className={`px-4 py-3 font-bold ${d.bajoStock ? 'text-[#ff4d6d]' : 'text-[#43e97b]'}`}>
                {d.unidadesDisponibles ?? 0}
              </td>
              <td className="px-4 py-3 text-[#52526a]">{d.unidadesMinimas ?? 0}</td>
              <td className="px-4 py-3 text-xs text-[#52526a]">
                {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('es-CO') : '—'}
              </td>
              <td className="px-4 py-3">
                {d.bajoStock ? (
                  <span className="text-[0.65rem] font-bold text-[#ff4d6d] bg-[rgba(255,77,109,0.1)] border border-[#ff4d6d]/30 px-2 py-1 rounded-full">
                    ⚠ CRÍTICO
                  </span>
                ) : (
                  <span className="text-[0.65rem] font-bold text-[#43e97b] bg-[rgba(67,233,123,0.1)] border border-[#43e97b]/30 px-2 py-1 rounded-full">
                    ● OK
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}