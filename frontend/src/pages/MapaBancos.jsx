import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { bancoService, inventarioService } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Fix íconos Leaflet + Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const iconoDefault = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconoUsuario = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#dc2626;border:3px solid white;
    box-shadow:0 0 0 3px rgba(220,38,38,0.4);
  "></div>`,
  iconAnchor: [10, 10],
});

// Componente que centra el mapa en la ubicación del usuario
function CentrarMapa({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) map.setView([lat, lon], 13);
  }, [lat, lon, map]);
  return null;
}

export default function MapaBancos() {
  const { user } = useAuth();

  const [bancos, setBancos] = useState([]);
  const [inventarios, setInventarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [ubicacion, setUbicacion] = useState(null);
  const [radioKm, setRadioKm] = useState(20);
  const [bancoSeleccionado, setBancoSeleccionado] = useState(null);

  // ── Obtener ubicación del usuario ────────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUbicacion({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUbicacion({ lat: 6.2442, lon: -75.5812 }) // default Medellín
      );
    } else {
      setUbicacion({ lat: 6.2442, lon: -75.5812 });
    }
  }, []);

  // ── Cargar bancos por radio ───────────────────────────────────────────────
  useEffect(() => {
    if (!ubicacion) return;
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await bancoService.buscarEnRadio(ubicacion.lat, ubicacion.lon, radioKm);
        setBancos(res.data);
      } catch (err) {
        console.error('Error cargando bancos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [ubicacion, radioKm]);

  // ── Cargar inventario de un banco al seleccionarlo ────────────────────────
  const cargarInventario = async (bancoId) => {
    if (inventarios[bancoId]) return; // ya cargado
    try {
      const res = await inventarioService.listarPorBanco(bancoId);
      setInventarios(prev => ({ ...prev, [bancoId]: res.data }));
    } catch (err) {
      console.error('Error cargando inventario:', err);
    }
  };

  return (
    <Layout>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          🗺️ Mapa de bancos
        </h1>
        <p className="text-[#52526a]">Encuentra el banco más cercano y su stock disponible</p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3 bg-[#111118] border border-[#1e1e2e] rounded-xl px-4 py-2.5">
          <span className="text-xs text-[#52526a] font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
            RADIO
          </span>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={radioKm}
            onChange={e => setRadioKm(Number(e.target.value))}
            className="w-28 accent-[#dc2626]"
          />
          <span className="text-sm font-bold text-[#e8e8f0] min-w-[40px]"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {radioKm} km
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-[#52526a]">
          <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
          <span>Tu ubicación</span>
          <div className="w-4 h-4 ml-3" style={{ background: `url(${iconUrl}) center/contain no-repeat` }}></div>
          <span>Banco de sangre</span>
        </div>

        <span className="ml-auto text-xs text-[#52526a]">
          {loading ? 'Buscando...' : `${bancos.length} banco${bancos.length !== 1 ? 's' : ''} encontrado${bancos.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Mapa */}
      <div className="rounded-2xl overflow-hidden border border-[#1e1e2e] mb-6" style={{ height: '480px' }}>
        {ubicacion && (
          <MapContainer
            center={[ubicacion.lat, ubicacion.lon]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <CentrarMapa lat={ubicacion.lat} lon={ubicacion.lon} />

            {/* Círculo de radio */}
            <Circle
              center={[ubicacion.lat, ubicacion.lon]}
              radius={radioKm * 1000}
              pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.05, weight: 1 }}
            />

            {/* Marcador usuario */}
            <Marker position={[ubicacion.lat, ubicacion.lon]} icon={iconoUsuario}>
              <Popup>
                <p className="font-bold text-red-600">📍 Tu ubicación</p>
              </Popup>
            </Marker>

            {/* Marcadores bancos */}
            {bancos.map(banco => (
              <Marker
                key={banco.id}
                position={[banco.latitud, banco.longitud]}
                icon={iconoDefault}
                eventHandlers={{
                  click: () => {
                    setBancoSeleccionado(banco);
                    cargarInventario(banco.id);
                  }
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <p style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                      {banco.nombre}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                      📍 {banco.direccion}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                      📞 {banco.telefono || 'Sin teléfono'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                      📏 {banco.distanciaKm?.toFixed(1)} km de distancia
                    </p>
                    {inventarios[banco.id] ? (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                          Stock disponible:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {inventarios[banco.id].map(inv => (
                            <span
                              key={inv.id}
                              style={{
                                background: inv.bajoStock ? '#fee2e2' : '#dcfce7',
                                color: inv.bajoStock ? '#dc2626' : '#16a34a',
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '9999px',
                                fontWeight: 'bold',
                              }}
                            >
                              {inv.tipoSangre}: {inv.unidadesDisponibles}u
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '11px', color: '#999' }}>
                        Clic para ver stock →
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Lista de bancos */}
      {!loading && bancos.length > 0 && (
        <div>
          <h3 className="text-lg font-extrabold mb-4 text-[#e8e8f0]"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Bancos en el radio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bancos.map(banco => (
              <div
                key={banco.id}
                onClick={() => {
                  setBancoSeleccionado(banco);
                  cargarInventario(banco.id);
                }}
                className={`bg-[#111118] border rounded-xl p-4 cursor-pointer transition-all hover:border-[#dc2626]/50 ${
                  bancoSeleccionado?.id === banco.id
                    ? 'border-[#dc2626]'
                    : 'border-[#1e1e2e]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-[#e8e8f0] text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {banco.nombre}
                  </p>
                  <span className="text-xs text-[#dc2626] font-bold ml-2 shrink-0">
                    {banco.distanciaKm?.toFixed(1)} km
                  </span>
                </div>
                <p className="text-xs text-[#52526a] mb-3">📍 {banco.ciudad} · {banco.horarioApertura && `${banco.horarioApertura} - ${banco.horarioCierre}`}</p>

                {/* Inventario */}
                {inventarios[banco.id] ? (
                  <div className="flex flex-wrap gap-1.5">
                    {inventarios[banco.id].map(inv => (
                      <span
                        key={inv.id}
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          inv.bajoStock
                            ? 'bg-[rgba(220,38,38,0.1)] text-[#dc2626] border border-[#dc2626]/30'
                            : 'bg-[rgba(67,233,123,0.1)] text-[#43e97b] border border-[#43e97b]/30'
                        }`}
                      >
                        {inv.tipoSangre} {inv.unidadesDisponibles}u
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#52526a]">Clic para ver stock disponible</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && bancos.length === 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-[#e8e8f0] font-bold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            No hay bancos en este radio
          </p>
          <p className="text-[#52526a] text-sm">Aumenta el radio de búsqueda</p>
        </div>
      )}

    </Layout>
  );
}