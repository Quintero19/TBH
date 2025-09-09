// services/publicAgendamiento.service.js
import api from "../utils/api";

const PUBLIC_AGENDAMIENTO_URL = "/agendamiento/publico";

export const publicAgendamientoService = {
  crearAgendamiento: async (data) => {
    try {
      console.log("🔍 Datos enviados al endpoint público:", JSON.stringify(data, null, 2));
      console.log("🔍 Estructura de serviciosAgendados:", data.serviciosAgendados);
      const res = await api.post(`${PUBLIC_AGENDAMIENTO_URL}`, data);
      
      if (!res.data) {
        console.error("La respuesta no contiene data:", res);
        throw new Error("Error en la respuesta del servidor");
      }

      return res.data;
    } catch (error) {
      console.error("Error en crearAgendamiento (público):", error);
      if (error.response?.data) {
        console.error("Detalles del error del servidor:", error.response.data);
        console.error("Status del error:", error.response.status);
        console.error("Headers del error:", error.response.headers);
      }
      throw error;
    }
  },

  obtenerAgendamientosPorCliente: async (clienteId) => {
    try {
      const res = await api.get(`${PUBLIC_AGENDAMIENTO_URL}/cliente/${clienteId}`);
      
      if (!res.data) {
        console.error("La respuesta no contiene data:", res);
        return [];
      }

      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(res.data)) {
        return res.data;
      }

      if (res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }

      if (res.data.agendamientos && Array.isArray(res.data.agendamientos)) {
        return res.data.agendamientos;
      }

      console.warn("Estructura de respuesta no reconocida para agendamientos:", res.data);
      return [];
    } catch (error) {
      console.error("Error en obtenerAgendamientosPorCliente (público):", error);
      throw error;
    }
  }
};
