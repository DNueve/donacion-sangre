import Layout from '../components/layout/Layout';

export default function ReporteInventario() {
  return (
    <Layout>
      <div className="mb-8">
        <p className="text-[#dc2626] text-xs font-bold uppercase tracking-wider mb-1"
           style={{ fontFamily: "'Syne', sans-serif" }}>
          Reporte
        </p>
        <h1 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
          Reporte de Inventario
        </h1>
        <p className="text-[#52526a]">Monitoreo de stock crítico y alertas de disponibilidad por tipo.</p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-[#e8e8f0] font-bold text-xl mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          En construcción
        </p>
        <p className="text-[#52526a] text-sm">
          Aquí verás el stock consolidado por tipo de sangre con semáforo verde/amarillo/rojo.
        </p>
      </div>
    </Layout>
  );
}