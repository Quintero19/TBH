import api from "../utils/api";

const USER_URL = "/tamano";

export const tamanosService = {
	crearTamano: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	crearRelaciones: async (data) => {
		const res = await api.post(`${USER_URL}/relaciones`, data);
		return res.data;
	},

	obtenerTamanos: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	obtenerTamanosActivos: async () => {
		const res = await api.get(`${USER_URL}/activas`);
		return res.data;
	},

	obtenerTamanoPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	actualizarTamano: async (id, tamano) => {
		const res = await api.put(`${USER_URL}/${id}`, tamano);
		return res.data;
	},

	actualizarEstadoTamano: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},

	eliminarTamano: async (id) => {
		const res = await api.delete(`${USER_URL}/${id}`);
		return res.data;
	},
};
