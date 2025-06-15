import api from "../utils/api";

const USER_URL = "/clientes";

export const clienteService = {
	crearCliente: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	listarClientes: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	listarClientePorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	listarClientePorDocumento: async (documento) => {
		const res = await api.get(`${USER_URL}/${documento}`);
		return res.data;
	},

	eliminarCliente: async (documento) => {
		const res = await api.delete(`${USER_URL}/${documento}`);
		return res.data;
	},

	buscarClientePorEmail: async (email) => {
		const res = await api.get(`${USER_URL}/email/${email}`);
		return res.data;
	},

	actualizarCliente: async (id, cliente) => {
		const res = await api.put(`${USER_URL}/${id}`, cliente);
		return res.data;
	},

	actualizarEstadoCliente: async (documento) => {
		const res = await api.put(`${USER_URL}/estado/${documento}`);
		return res.data;
	},
};
