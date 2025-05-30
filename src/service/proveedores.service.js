import api from '../utils/api';

const USER_URL = '/proveedores';

export const proveedorService = {
    crearProveedor: async (data) => {
        const res = await api.post(USER_URL, data);
        return res.data;
    },

    obtenerProveedores: async () => {
        const res = await api.get(USER_URL);
        return res.data;
    },

    obtenerProveedoresActivos: async () => {
        const res = await api.get(`${USER_URL}/activos`);
        return res.data;
    },

    obtenerProveedorPorId: async (id) => {
        const res = await api.get(`${USER_URL}/${id}`);
        return res.data;
    },

    actualizarProveedor: async (id, proveedor) => {
        const res = await api.put(`${USER_URL}/${id}`, proveedor);
        return res.data;
    },

    actualizarEstadoProveedor: async (id) => {
        const res = await api.put(`${USER_URL}/estado/${id}`);
        return res.data;
    },

    eliminarProveedor: async (id) => {
        const res = await api.delete(`${USER_URL}/${id}`);
        return res.data;
    }

};
