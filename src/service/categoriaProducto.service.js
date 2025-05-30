import api from "../utils/api";

const USER_URL = "/categoria-producto";

export const catProductoService = {
    crearCategoria: async (data) => {
        const res = await api.post(USER_URL, data);
        return res.data;
    },

    obtenerCategorias: async () => {
        const res = await api.get(USER_URL);
        return res.data;
    },

    obtenerCategoriasActivas: async () => {
        const res = await api.get(`${USER_URL}/activas`);
        return res.data;
    },

    obtenerCategoriasRopa: async() => {
        const res = await api.get(`${USER_URL}/ropa`);
        return res.data;
    },

    obtenerCategoriaPorId: async (id) => {
        const res = await api.get(`${USER_URL}/${id}`);
        return res.data;
    },

    actualizarCategoria: async (id, categoria) => {
        const res = await api.put(`${USER_URL}/${id}`, categoria);
        return res.data;
    },

    actualizarEstadoCategoria: async (id) => {
        const res = await api.put(`${USER_URL}/estado/${id}`);
        return res.data;
    },

    eliminarCategoria: async (id) => {
        const res = await api.delete(`${USER_URL}/${id}`);
        return res.data;
    },
};
