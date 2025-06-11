import api from "../utils/api";

const PERMISO_URL = "/permisos";

export const permisoService = {

    listarPermisos: async () => {
        const res = await api.get(PERMISO_URL);
        return res.data.data;
    },

    listarPermisosId: async (id) => {
        const res = await api.get(`${PERMISO_URL}/${id}`);
        return res.data.data;
    },
};
