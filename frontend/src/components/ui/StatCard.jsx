// Card de estadística reutilizable
// Variantes: 'gradient' (con gradiente de color) o 'dark' (fondo oscuro)
export default function StatCard({ 
  label, 
  value, 
  subtitle, 
  icon, 
  variant = 'dark',
  gradient = 'from-[#dc2626] to-[#991b1b]',
  valueColor = 'text-[#e8e8f0]',
  hoverColor = 'hover:border-[#dc2626]/30'
}) {
  
  if (variant === 'gradient') {
    return (
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 relative overflow-hidden`}>
        {icon && <div className="absolute top-0 right-0 text-9xl opacity-10">{icon}</div>}
        <div className="relative z-10">
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-2"
             style={{ fontFamily: "'Syne', sans-serif" }}>
            {label}
          </p>
          <p className="text-5xl font-extrabold text-white"
             style={{ fontFamily: "'Syne', sans-serif" }}>
            {value}
          </p>
          {subtitle && <p className="text-white/80 text-sm mt-2">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 relative overflow-hidden ${hoverColor} transition-colors`}>
      {icon && <div className="absolute top-0 right-0 text-9xl opacity-5">{icon}</div>}
      <div className="relative z-10">
        <p className="text-[#52526a] text-xs font-bold uppercase tracking-wider mb-2"
           style={{ fontFamily: "'Syne', sans-serif" }}>
          {label}
        </p>
        <p className={`text-5xl font-extrabold ${valueColor}`}
           style={{ fontFamily: "'Syne', sans-serif" }}>
          {value}
        </p>
        {subtitle && <p className="text-[#52526a] text-sm mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}   