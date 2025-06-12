import api from "../utils/api";

const DEVOLUCION_URL = "/devolucion";

export const devolucionService = {
    crearDevolucion: async(data) => {
        const res = await api.post(DEVOLUCION_URL, data);
        return res.data;
    },

    obtenerDevolucion: async()=>{
        const res = await api.get(DEVOLUCION_URL);
        return res.data;
    },
    obtenerDevolucionPorId: async(id)=>{
        const res = await api.get(`${DEVOLUCION_URL}/${id}`);
        return res.data;
    },
    actualizarDevolucion: async(id,devolucion)=>{
        const res  = await api.put(`${DEVOLUCION_URL}/${id}`,devolucion);
        return res.data
    },
    actualizarEstadoDevolucion: async(id) =>{
        const res  = await api.put(`${DEVOLUCION_URL}/estado/${id}`);
        return res.data;
    },
    eliminarDevolucion: async(id)=>{
        const res = await api.delete(`${DEVOLUCION_URL}/${id}`);
        return res.data;
    }
}