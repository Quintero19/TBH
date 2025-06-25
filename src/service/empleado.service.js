import api from "../utils/api";

const EMPLEADO_URL = "/empleados";

export const empleadoService = {
	crearEmpleado: async (data) => {
		const res = await api.post(EMPLEADO_URL, data);
		return res.data;
	},

	obtenerEmpleados: async () => {
		const res = await api.get(EMPLEADO_URL);
		return res.data;
	},

	obtenerEmpleadosActivos: async () => {
    try {
      const res = await api.get(`${EMPLEADO_URL}/activos`);
      
      if (!res.data) {
        console.error("La respuesta no contiene data:", res);
        return [];
      }
      
      if (Array.isArray(res.data)) {
        return res.data;
      }
      
      if (res.data.empleados || res.data.data || res.data.items) {
        return res.data.empleados || res.data.data || res.data.items;
      }
      
      console.warn("Estructura de respuesta no reconocida:", res.data);
      return [];
    } catch (error) {
      console.error("Error en obtenerEmpleadosActivos:", error);
      throw error;
    }
  },

	obtenerEmpleadoPorId: async (id) => {
		const res = await api.get(`${EMPLEADO_URL}/${id}`);
		return res.data;
	},

	actualizarEmpleado: async (id, empleado) => {
		const res = await api.put(`${EMPLEADO_URL}/${id}`, empleado);
		return res.data;
	},

	actualizarEstadoEmpleado: async (id) => {
		const res = await api.put(`${EMPLEADO_URL}/estado/${id}`);
		return res.data;
	},

	eliminarEmpleado: async (id) => {
		const res = await api.delete(`${EMPLEADO_URL}/${id}`);
		return res.data;
	},
};
