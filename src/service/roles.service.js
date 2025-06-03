import api from "../utils/api";

const ROL_URL = "/roles";

export const rolService = {
    crearRoles: async (data) => {
        const res = await api.post(ROL_URL, data);
        return res.data;
    },

    listarRoles: async () => {
		const res = await api.get(ROL_URL);
		return res.data;
	},

    listarRolesId: async (id) => {
        const res = await api.get(`${ROL_URL}/${id}`);
        return res.data;
    },

    actualizarRoles: async (id, rol) => {
		const res = await api.put(`${ROL_URL}/${id}`, rol);
		return res.data;
	},

    eliminarRoles: async (id) => {
		const res = await api.delete(`${ROL_URL}/${id}`);
		return res.data;
	},

    cambiarEstadoRoles: async(id) => {
		const res = await api.put(`${ROL_URL}/estado/${id}`);
		return res.data;
	}
}