import axios from "axios";
import { API_BASE_URL } from "@/config";

const agendamientoService = {
	// Crear un nuevo agendamiento
	crearAgendamiento: async (agendamientoData) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/agendamientos`,
				agendamientoData,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
			return response.data;
		} catch (error) {
			console.error("Error al crear agendamiento:", error);
			throw error;
		}
	},

	// Obtener todos los agendamientos
	obtenerAgendamientos: async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/agendamientos`);
			return response.data;
		} catch (error) {
			console.error("Error al obtener agendamientos:", error);
			throw error;
		}
	},

	// Obtener un agendamiento por ID
	obtenerAgendamientoPorId: async (id) => {
		try {
			const response = await axios.get(`${API_BASE_URL}/agendamientos/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error al obtener agendamiento con ID ${id}:`, error);
			throw error;
		}
	},

	// Actualizar un agendamiento
	actualizarAgendamiento: async (id, agendamientoData) => {
		try {
			const response = await axios.put(
				`${API_BASE_URL}/agendamientos/${id}`,
				agendamientoData,
				{
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
			return response.data;
		} catch (error) {
			console.error(`Error al actualizar agendamiento con ID ${id}:`, error);
			throw error;
		}
	},

	// Eliminar un agendamiento
	eliminarAgendamiento: async (id) => {
		try {
			const response = await axios.delete(
				`${API_BASE_URL}/agendamientos/${id}`,
			);
			return response.data;
		} catch (error) {
			console.error(`Error al eliminar agendamiento con ID ${id}:`, error);
			throw error;
		}
	},

	// Obtener agendamientos por cliente
	obtenerAgendamientosPorCliente: async (idCliente) => {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/agendamientos/cliente/${idCliente}`,
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error al obtener agendamientos para cliente ${idCliente}:`,
				error,
			);
			throw error;
		}
	},

	// Obtener agendamientos por empleado
	obtenerAgendamientosPorEmpleado: async (idEmpleado) => {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/agendamientos/empleado/${idEmpleado}`,
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error al obtener agendamientos para empleado ${idEmpleado}:`,
				error,
			);
			throw error;
		}
	},

	// Cambiar estado de agendamiento
	cambiarEstadoAgendamiento: async (id, nuevoEstado) => {
		try {
			const response = await axios.patch(
				`${API_BASE_URL}/agendamientos/${id}/estado`,
				{ estado: nuevoEstado },
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error al cambiar estado del agendamiento con ID ${id}:`,
				error,
			);
			throw error;
		}
	},
};

export default agendamientoService;
