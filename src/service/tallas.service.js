import api from "../utils/api";

const USER_URL = "/tallas";

export const tallasService = {
	crearTalla: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	obtenerTallas: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	obtenerTallaPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	actualizarTalla: async (id, talla) => {
		const res = await api.put(`${USER_URL}/${id}`, talla);
		return res.data;
	},

	actualizarEstadoTalla: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},

	eliminarTalla: async (id) => {
		const res = await api.delete(`${USER_URL}/${id}`);
		return res.data;
	},
};
