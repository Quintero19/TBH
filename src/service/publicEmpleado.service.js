// services/publicEmpleado.service.js
import api from "../utils/api";

const PUBLIC_EMPLEADO_URL = "/empleados/publico";

export const publicEmpleadoService = {
  obtenerEmpleadosActivos: async () => {
    try {
      const res = await api.get(`${PUBLIC_EMPLEADO_URL}/activos`);

      if (!res.data) {
        console.error("La respuesta no contiene data:", res);
        return [];
      }

      // Ajustado para la estructura de respuesta del endpoint público
      if (Array.isArray(res.data)) {
        return res.data;
      }

      if (res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }

      if (res.data.empleados || res.data.items) {
        return res.data.empleados || res.data.items;
      }

      console.warn("Estructura de respuesta no reconocida:", res.data);
      return [];
    } catch (error) {
      console.error("Error en obtenerEmpleadosActivos (público):", error);
      throw error;
    }
  },

  obtenerServiciosEmpleado: async (id) => {
    try {
      const res = await api.get(`${PUBLIC_EMPLEADO_URL}/${id}/servicios`);
      
      if (!res.data) {
        console.error("La respuesta no contiene data:", res);
        return { servicios: [] };
      }

      // Manejar diferentes estructuras de respuesta
      if (res.data.servicios && Array.isArray(res.data.servicios)) {
        return res.data;
      }

      if (res.data.data && res.data.data.servicios && Array.isArray(res.data.data.servicios)) {
        return res.data.data;
      }

      if (Array.isArray(res.data)) {
        return { servicios: res.data };
      }

      console.warn("Estructura de respuesta no reconocida para servicios:", res.data);
      return { servicios: [] };
    } catch (error) {
      console.error("Error en obtenerServiciosEmpleado (público):", error);
      throw error;
    }
  }
};