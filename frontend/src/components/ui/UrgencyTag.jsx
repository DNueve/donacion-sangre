export default function UrgencyTag({ nivel }) {
  const colores = {
    ALTA:  'bg-[#ff4d6d] text-white',
    MEDIA: 'bg-[#f59e0b] text-white',
    BAJA:  'bg-[#43e97b] text-white',
    // Lowercase también funciona
    alta:  'bg-[#ff4d6d] text-white',
    media: 'bg-[#f59e0b] text-white',
    baja:  'bg-[#43e97b] text-white',
  };

  return (
    <span 
      className={`${colores[nivel] || 'bg-[#52526a] text-white'} text-[0.65rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider`}
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      {nivel}
    </span>
  );
}