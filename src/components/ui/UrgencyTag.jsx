const estilos = {
  alta: 'bg-red-100 text-red-700 border border-red-400',
  media: 'bg-yellow-100 text-yellow-700 border border-yellow-400',
  baja: 'bg-green-100 text-green-700 border border-green-400',
};

const iconos = {
  alta: '🚨',
  media: '⚠️',
  baja: '✅',
};

export default function UrgencyTag({ nivel }) {
  const estilo = estilos[nivel] || estilos.baja;
  const icono = iconos[nivel] || '✅';
  return (
    <span className={`${estilo} px-3 py-1 rounded-full text-sm font-semibold`}>
      {icono} {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
    </span>
  );
}