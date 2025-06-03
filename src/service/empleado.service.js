import api from "../utils/api";

const EMPLEADO_URL = "/empleados";

export const empleadoService = {
    crearEmpleado: async (data) => {
        const res = await api.post(EMPLEADO_URL, data);
        return res.data;
    },

    obtenerEmpleados: async () => {
        const res = await api.get(EMPLEADO_URL);
        return res.data;
    },

    obtenerEmpleadosActivos: async () => {
        const res = await api.get(`${EMPLEADO_URL}/activos`);
        return res.data;
    },

    obtenerEmpleadoPorId: async (id) => {
        const res = await api.get(`${EMPLEADO_URL}/${id}`);
        return res.data;
    },

    actualizarEmpleado: async (id, empleado) => {
        const res = await api.put(`${EMPLEADO_URL}/${id}`, empleado);
        return res.data;
    },

    actualizarEstadoEmpleado: async (id) => {
        const res = await api.put(`${EMPLEADO_URL}/estado/${id}`);
        return res.data;
    },

    eliminarEmpleado: async (id) => {
        const res = await api.delete(`${EMPLEADO_URL}/${id}`);
        return res.data;
    },
};
