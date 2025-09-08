import api from "../utils/api";

const SERVICIO_URL = "/servicios";

export const servicioService = {
	// Crear un nuevo servicio
	crearServicio: async (data) => {
		const res = await api.post(SERVICIO_URL, data);
		return res.data;
	},

	// Obtener todos los servicios (renombrado de listarServicios → obtenerServicios)
	obtenerServicios: async () => {
		const res = await api.get(SERVICIO_URL);
		return res.data;
	},

	obtenerServiciosActivos: async () => {
		const res = await api.get(`${SERVICIO_URL}/activos`);
		return res.data;
	},

	// Obtener un servicio por ID
	obtenerServicioPorId: async (id) => {
		const res = await api.get(`${SERVICIO_URL}/${id}`);
		return res.data;
	},

	// Actualizar un servicio por ID
	actualizarServicio: async (id, data) => {
		const res = await api.put(`${SERVICIO_URL}/${id}`, data);
		return res.data;
	},

	// Eliminar un servicio por ID (renombrado de eliminarServicio → eliminarServicios)
	eliminarServicios: async (id) => {
		const res = await api.delete(`${SERVICIO_URL}/${id}`);
		return res.data;
	},

	// Cambiar el estado del servicio (renombrado de cambiarEstadoServicio → actualizarEstadoServicios)
	actualizarEstadoServicios: async (id) => {
		const res = await api.put(`${SERVICIO_URL}/estado/${id}`);
		return res.data;
	},
};
