import axios from 'axios';

const BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/api/v1/auth/login', data),
  registro: (data) => api.post('/api/v1/auth/registro', data),
};

// ── Solicitudes ─────────────────────────────────────────────────────────────
export const solicitudService = {
  listarActivas: () =>
    api.get('/api/solicitudes/activas'),

  obtenerPorId: (id) =>
    api.get(`/api/solicitudes/${id}`),

  listarPorBanco: (bancoId) =>
    api.get(`/api/solicitudes/banco/${bancoId}`),

  listarPorTipoSangre: (tipoSangre) =>
    api.get(`/api/solicitudes/tipo-sangre/${tipoSangre}`),

  listarPorUrgencia: (urgencia) =>
    api.get(`/api/solicitudes/urgencia/${urgencia}`),

  buscarEnRadio: (lat, lon, radioKm = 50) =>
    api.get(`/api/solicitudes/radio?lat=${lat}&lon=${lon}&radioKm=${radioKm}`),

  buscarPorTipoSangreEnRadio: (tipoSangre, lat, lon, radioKm = 50) =>
    api.get(`/api/solicitudes/radio/tipo-sangre/${tipoSangre}?lat=${lat}&lon=${lon}&radioKm=${radioKm}`),

  crear: (data) =>
    api.post('/api/solicitudes', data),

  actualizar: (id, data) =>
    api.put(`/api/solicitudes/${id}`, data),

  cambiarEstado: (id, estado) =>
    api.patch(`/api/solicitudes/${id}/estado?estado=${estado}`),

  eliminar: (id) =>
    api.delete(`/api/solicitudes/${id}`),
};

// ── Bancos ──────────────────────────────────────────────────────────────────
export const bancoService = {
  listarActivos: () =>
    api.get('/api/bancos/activos'),

  listarTodos: () =>
    api.get('/api/bancos'),

  obtenerPorId: (id) =>
    api.get(`/api/bancos/${id}`),

  listarPorCiudad: (ciudad) =>
    api.get(`/api/bancos/ciudad/${ciudad}`),

  listarPorDepartamento: (departamento) =>
    api.get(`/api/bancos/departamento/${departamento}`),

  buscarEnRadio: (lat, lon, radioKm = 20) =>
    api.get(`/api/bancos/radio?lat=${lat}&lon=${lon}&radioKm=${radioKm}`),

  crear: (data) =>
    api.post('/api/bancos', data),

  actualizar: (id, data) =>
    api.put(`/api/bancos/${id}`, data),

  desactivar: (id) =>
    api.patch(`/api/bancos/${id}/desactivar`),

  eliminar: (id) =>
    api.delete(`/api/bancos/${id}`),
};

// ── Donaciones ──────────────────────────────────────────────────────────────
export const donacionService = {
  registrar: (data) =>
    api.post('/api/donaciones', data),

  obtenerPorId: (id) =>
    api.get(`/api/donaciones/${id}`),

  listarPorUsuario: (usuarioId) =>
    api.get(`/api/donaciones/usuario/${usuarioId}`),

  historialUsuario: (usuarioId) =>
    api.get(`/api/donaciones/usuario/${usuarioId}/historial`),

  listarPorBanco: (bancoId) =>
    api.get(`/api/donaciones/banco/${bancoId}`),

  listarPorEstado: (estado) =>
    api.get(`/api/donaciones/estado/${estado}`),

  cambiarEstado: (id, estado) =>
    api.patch(`/api/donaciones/${id}/estado?estado=${estado}`),

  eliminar: (id) =>
    api.delete(`/api/donaciones/${id}`),
};

// ── Inventario ──────────────────────────────────────────────────────────────
export const inventarioService = {
  listarPorBanco: (bancoId) =>
    api.get(`/api/inventario/banco/${bancoId}`),

  listarBajoStockPorBanco: (bancoId) =>
    api.get(`/api/inventario/banco/${bancoId}/bajo-stock`),

  listarTodoBajoStock: () =>
    api.get('/api/inventario/bajo-stock'),

  listarDisponiblesPorTipoSangre: (tipoSangre) =>
    api.get(`/api/inventario/tipo-sangre/${tipoSangre}`),

  crear: (data) =>
    api.post('/api/inventario', data),

  actualizar: (id, data) =>
    api.put(`/api/inventario/${id}`, data),

  ajustarUnidades: (bancoId, tipoSangre, cantidad) =>
    api.patch(`/api/inventario/ajustar?bancoId=${bancoId}&tipoSangre=${tipoSangre}&cantidad=${cantidad}`),

  eliminar: (id) =>
    api.delete(`/api/inventario/${id}`),
};

// ── Matching ────────────────────────────────────────────────────────────────
export const matchingService = {
  buscarPorSolicitud: (solicitudId) =>
    api.get(`/api/matching/solicitud/${solicitudId}`),

  buscarCompatibles: (tipoSangre, lat, lon, radioKm = 50) =>
    api.get(`/api/matching/buscar?tipoSangre=${tipoSangre}&lat=${lat}&lon=${lon}&radioKm=${radioKm}`),
};

export default api;