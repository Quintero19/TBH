import api from "../utils/api";

const USER_URL = "/compras";

export const compraService = {
    crearCompra: async (data) => {
        const res = await api.post(USER_URL, data);
        return res.data;
    },

    obtenerCompras: async () => {
        const res = await api.get(USER_URL);
        return res.data;
    },

    obtenerCompraPorId: async (id) => {
        const res = await api.get(`${USER_URL}/${id}`);
        return res.data;
    },

    obtenerCompraConDetalles: async (id) => {
        const res = await api.get(`${USER_URL}/detalles/${id}`);
        return res.data;
    },

    crearDetallesCompra: async (data) => {
        const res = await api.post(`${USER_URL}/detalles-compra`, data);
        return res.data;
    },

    cambiarEstadoCompra: async (id) => {
        const res = await api.put(`${USER_URL}/estado/${id}`);
        return res.data;
    },
};
