import api from "../utils/api";

const USER_URL = "/usuarios";

export const userService = {
	crearUsuario: async (data) => {
		const res = await api.post(USER_URL, data);
		return res.data;
	},

	listarUsuarios: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	listarUsuarioPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	listarUsuarioPorDocumento: async (documento) => {
		const res = await api.get(`${USER_URL}/${documento}`);
		return res.data;
	},

	eliminarUsuario: async (documento) => {
		const res = await api.delete(`${USER_URL}/${documento}`);
		return res.data;
	},

	buscarUsuarioPorEmail: async (email) => {
		const res = await api.get(`${USER_URL}/email/${email}`);
		return res.data;
	},

	actualizarUsuario: async (id, usuario) => {
		const res = await api.put(`${USER_URL}/${id}`, usuario);
		return res.data;
	},

	actualizarEstadoUsuario: async (documento) => {
		const res = await api.put(`${USER_URL}/estado/${documento}`);
		return res.data;
	},
};
