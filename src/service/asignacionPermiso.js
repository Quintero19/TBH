import api from "../utils/api";

const ROL_PERMISO_URL = "/roles-permiso";

export const rolPermisoService = {
	crearRolPermiso: async (data) => {
		const res = await api.post(ROL_PERMISO_URL, data);
		return res.data;
	},

	listarRolPermisos: async () => {
		const res = await api.get(ROL_PERMISO_URL);
		return res.data;
	},

	listarRolPermisoId: async (id) => {
		const res = await api.get(`${ROL_PERMISO_URL}/${id}`);
		return res.data;
	},

	listarPermisosPorRol: async (rolId) => {
		const res = await api.get(`${ROL_PERMISO_URL}/rol/${rolId}`);
		return res.data;
	},

	actualizarRolPermiso: async (id, data) => {
		const res = await api.put(`${ROL_PERMISO_URL}/${id}`, data);
		return res.data;
	},

	eliminarRolPermiso: async (id) => {
		const res = await api.delete(`${ROL_PERMISO_URL}/${id}`);
		return res.data;
	},
	cambiarEstadoRolPermiso: async (id) => {
		const res = await api.put(`${ROL_PERMISO_URL}/estado/${id}`);
		return res.data;
	},
};
