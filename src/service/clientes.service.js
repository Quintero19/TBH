import api from "../utils/api";

const CLIENTE_URL = "/clientes";

export const clienteService = {
	crearCliente: async (data) => {
		const res = await api.post(CLIENTE_URL, data);
		return res.data;
	},

	listarClientes: async () => {
		const res = await api.get(CLIENTE_URL);
		return res.data;
	},

	listarClientePorId: async (id) => {
		const res = await api.get(`${CLIENTE_URL}/id/${id}`);
		return res.data;
	},
	

	listarClientePorDocumento: async (documento) => {
		try {
			const res = await api.get(`${CLIENTE_URL}/documento/${documento}`);
			return res.data; 
		} catch (error) {
			if (error.response && error.response.status === 404) {
			console.log(`Cliente con documento ${documento} no encontrado.`);
			return null;
			}
			throw error; 
		}
		},


	eliminarCliente: async (id) => {
		const res = await api.delete(`${CLIENTE_URL}/${id}`);
		return res.data;
	},

	buscarClientePorEmail: async (email) => {
		const res = await api.get(`${CLIENTE_URL}/email/${email}`);
		return res.data;
	},

	actualizarCliente: async (id, cliente) => {
		const res = await api.put(`${CLIENTE_URL}/${id}`, cliente);
		return res.data;
	},

	actualizarEstadoCliente: async (id) => {
		const res = await api.put(`${CLIENTE_URL}/estado/${id}`);
		return res.data;
	},
};
