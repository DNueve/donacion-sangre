import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para los íconos de Leaflet con Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const iconoPorDefecto = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const bancos = [
  {
    id: 1,
    nombre: 'Banco de Sangre Hospital San Rafael',
    direccion: 'Calle 69 #63-68, Medellín',
    lat: 6.2518,
    lng: -75.5636,
    tipos: ['O+', 'O-', 'A+'],
    telefono: '604 445 9000',
  },
  {
    id: 2,
    nombre: 'Banco de Sangre Clínica Las Américas',
    direccion: 'Cra. 54 #67B-93, Medellín',
    lat: 6.2371,
    lng: -75.5900,
    tipos: ['A+', 'B+', 'AB+'],
    telefono: '604 342 1212',
  },
  {
    id: 3,
    nombre: 'Banco de Sangre Pablo Tobón Uribe',
    direccion: 'Calle 78B #69-240, Medellín',
    lat: 6.2650,
    lng: -75.5812,
    tipos: ['O+', 'B-', 'AB-'],
    telefono: '604 445 9000',
  },
  {
    id: 4,
    nombre: 'Banco de Sangre Antioquia',
    direccion: 'Cra. 43A #1-50, Medellín',
    lat: 6.2089,
    lng: -75.5742,
    tipos: ['O-', 'A-', 'B+'],
    telefono: '604 354 2020',
  },
  {
    id: 5,
    nombre: 'Clínica del Norte',
    direccion: 'Calle 52 #68-50, Bello',
    lat: 6.3367,
    lng: -75.5567,
    tipos: ['A+', 'O+'],
    telefono: '604 678 1234',
  },
];

export default function MapaBancos() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🗺️ Mapa de bancos de sangre</h1>
        <p className="text-gray-500">Encuentra el banco más cercano a ti</p>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden" style={{ height: '520px' }}>
        <MapContainer
          center={[6.2518, -75.5636]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bancos.map((banco) => (
            <Marker
              key={banco.id}
              position={[banco.lat, banco.lng]}
              icon={iconoPorDefecto}
            >
              <Popup>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-red-600">{banco.nombre}</p>
                  <p className="text-sm text-gray-600">📍 {banco.direccion}</p>
                  <p className="text-sm text-gray-600">📞 {banco.telefono}</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {banco.tipos.map((t) => (
                      <span key={t} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Layout>
  );
}