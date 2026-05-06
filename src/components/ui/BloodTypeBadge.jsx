const colores = {
  'O+': 'bg-red-500 text-white',
  'O-': 'bg-red-700 text-white',
  'A+': 'bg-blue-500 text-white',
  'A-': 'bg-blue-700 text-white',
  'B+': 'bg-green-500 text-white',
  'B-': 'bg-green-700 text-white',
  'AB+': 'bg-purple-500 text-white',
  'AB-': 'bg-purple-700 text-white',
};

export default function BloodTypeBadge({ tipo }) {
  const color = colores[tipo] || 'bg-gray-400 text-white';
  return (
    <span className={`${color} px-3 py-1 rounded-full font-bold text-sm`}>
      {tipo}
    </span>
  );
}