import api from "@/utils/api";

const RESOURCE_URL = "/insumos";

export const insumoService = {
	obtenerInsumos: async () => {
		const res = await api.get(RESOURCE_URL);
		return res.data;
	},

	crearInsumo: async (data) => {
		const res = await api.post(RESOURCE_URL, data);
		return res.data;
	},

	obtenerInsumoPorId: async (id) => {
		const res = await api.get(`${RESOURCE_URL}/${id}`);
		return res.data;
	},

	obtenerInsumosBase: async () => {
		const res = await api.get(`${RESOURCE_URL}/base`);
		return res.data;
	},

	obtenerInsumosFrascos: async () => {
		const res = await api.get(`${RESOURCE_URL}/frascos`);
		return res.data;
	},

	obtenerInsumosFragancia: async () => {
		const res = await api.get(`${RESOURCE_URL}/fragancias`);
		return res.data;
	},

	actualizarInsumo: async (id, data) => {
		const res = await api.put(`${RESOURCE_URL}/${id}`, data);
		return res.data;
	},

	actualizarEstadoInsumo: async (id, nuevoEstado) => {
		const res = await api.patch(`${RESOURCE_URL}/estado/${id}`, {
			Estado: nuevoEstado,
		});
		return res.data;
	},

	eliminarInsumo: async (id) => {
		const res = await api.delete(`${RESOURCE_URL}/${id}`);
		return res.data;
	},
};
