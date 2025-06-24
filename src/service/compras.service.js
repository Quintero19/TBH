import api from "../utils/api";

const USER_URL = "/compras";

export const comprasService = {
	crearCompra: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	obtenerCompras: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	cambiarEstadoCompra: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},
};
