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

	// Cambiar el estado (anular) de una venta
	cambiarEstadoVenta: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},

	// Obtener una venta por ID
	obtenerVentaPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	}
};
