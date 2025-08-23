// src/service/ventas.service.js
import api from "../utils/api";

const USER_URL = "/ventas";

export const ventasService = {
	// Crear nueva venta
	crearVenta: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	// Obtener todas las ventas
	obtenerVentas: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	// Marcar venta como completada (cambiar estado de 3 a 1)
	marcarVentaCompletada: async (id) => {
		const res = await api.patch(`${USER_URL}/${id}/completar`);
		return res.data;
	},

	// Anular venta (cambiar estado de 3 a 2)
	anularVenta: async (id) => {
		const res = await api.patch(`${USER_URL}/${id}/anular`);
		return res.data;
	},

	// Cambiar el estado (anular) de una venta (método legacy)
	cambiarEstadoVenta: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},

	// Obtener una venta por ID
	obtenerVentaPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},
};
