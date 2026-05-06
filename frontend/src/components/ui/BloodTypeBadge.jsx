export default function BloodTypeBadge({ tipo, size = 'md' }) {
  const colores = {
    'O+':  'from-[#dc2626] to-[#991b1b]',
    'O-':  'from-[#ff4d6d] to-[#dc2626]',
    'A+':  'from-[#f59e0b] to-[#dc2626]',
    'A-':  'from-[#fbbf24] to-[#f59e0b]',
    'B+':  'from-[#8b5cf6] to-[#6d28d9]',
    'B-':  'from-[#a78bfa] to-[#8b5cf6]',
    'AB+': 'from-[#ec4899] to-[#be185d]',
    'AB-': 'from-[#f472b6] to-[#ec4899]',
  };

  const tamaños = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  const gradient = colores[tipo] || 'from-[#dc2626] to-[#991b1b]';

  return (
    <div 
      className={`bg-gradient-to-br ${gradient} ${tamaños[size]} rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg`}
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      {tipo || 'N/A'}
    </div>
  );
}