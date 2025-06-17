import api from "@/utils/api";

const RESOURCE_URL = "/categoria-insumo";

export const categoriaInsumoService = {
	obtenerCategorias: async () => {
		const res = await api.get(RESOURCE_URL);
		return res.data;
	},

	crearCategoria: async (data) => {
		const res = await api.post(RESOURCE_URL, data);
		return res.data;
	},

	obtenerCategoriaPorId: async (id) => {
		const res = await api.get(`${RESOURCE_URL}/${id}`);
		return res.data;
	},
	actualizarCategoria: async (id, data) => {
		const res = await api.put(`${RESOURCE_URL}/${id}`, data);
		return res.data;
	},

	actualizarEstadoCategoria: async (id, nuevoEstado) => {
		const res = await api.patch(`${RESOURCE_URL}/estado/${id}`, {
			estado: nuevoEstado,
		});
		return res.data;
	},

	eliminarCategoria: async (id) => {
		const res = await api.delete(`${RESOURCE_URL}/${id}`);
		return res.data;
	},
	// hola nando se te perdio algo????
};
