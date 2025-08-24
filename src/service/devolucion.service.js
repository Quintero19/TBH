import api from "../utils/api";

const DEVOLUCION_URL = "/devoluciones"; 

export const devolucionService = {
  cambiarEstadoDevolucion: async (id, estado) => {
    try {
      const idParam = id.toString();
      const url = `${DEVOLUCION_URL}/${idParam}/estado`;
      const body = { Estado: estado };
      
      const res = await api.put(url, body);
      return res.data;
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          const errorMsg = error.response.data?.message || "ID de devolución no válido";
          throw new Error(errorMsg);
        }
        if (error.response.status === 404) {
          throw new Error("Endpoint no encontrado. Verifica la URL del servicio.");
        }
      }
      
      throw new Error(error.message || 'Error de conexión al cambiar estado');
    }
  },

  // Crear nueva devolución
  crearDevolucion: async (data) => {
    try {
      const res = await api.post(DEVOLUCION_URL, data);
      return res.data;
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw new Error('Error de conexión al crear devolución');
    }
  },

  // Obtener todas las devoluciones
  listarDevoluciones: async () => {
    try {
      const res = await api.get(DEVOLUCION_URL);
      return res.data.data || res.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una devolución por ID
  obtenerDevolucionPorId: async (id) => {
    try {
      const res = await api.get(`${DEVOLUCION_URL}/${id}`);
      return res.data.data || res.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una devolución
  eliminarDevolucion: async (id) => {
    try {
      const res = await api.delete(`${DEVOLUCION_URL}/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener compras de ropa de un cliente
  obtenerComprasRopaCliente: async (idCliente) => {
    try {
      const response = await api.get(`${DEVOLUCION_URL}/cliente/${idCliente}/compras-ropa`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },
  
};
