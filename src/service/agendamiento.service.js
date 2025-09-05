import api from "../utils/api";

const USER_URL = "/agendamiento";

export const agendamientosService = {
	crearAgendamiento: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	obtenerAgendamientoPorFecha: async (fecha) => {
		const res = await api.get(`${USER_URL}/fecha/${fecha}`);
		return res.data;
	},

	obtenerAgendamientoPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	eliminarAgendamiento: async (id) => {
		const res = await api.delete(`${USER_URL}/${id}`);
		return res.data;
	},
}