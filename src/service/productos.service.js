import api from "../utils/api";

const USER_URL = "/productos";

export const productoService = {
	crearProducto: async (formData) => {
		const res = await api.post(USER_URL, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return res.data;
	},

	obtenerProductoss: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	/* obtenerProductosActivos: async () => {
		const res = await api.get(`${USER_URL}/activos`);
		return res.data;
	}, */

	obtenerProductoPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	actualizarProducto: async (id, producto) => {
		const res = await api.put(`${USER_URL}/${id}`, producto, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return res.data;
	},

	actualizarEstadoProducto: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},

	eliminarProducto: async (id) => {
		const res = await api.delete(`${USER_URL}/${id}`);
		return res.data;
	},
};
