import BloodTypeBadge from './BloodTypeBadge';
import UrgencyTag from './UrgencyTag';

export default function UrgenciaCard({ urgencia, onClick }) {
  return (
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
              <span>📅 Hasta {new Date(urgencia.fechaLimite).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onClick}
          className="bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#dc2626]/30 transition-all"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          QUIERO AYUDAR →
        </button>
      </div>
    </div>
  );
}