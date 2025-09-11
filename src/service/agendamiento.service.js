// agendamiento.service.js
import api from "../utils/api";

const AGENDAMIENTO_URL = "/agendamiento"; // <- nombre claro y consistente

export const agendamientosService = {
  crearAgendamiento: async (data) => {
    const res = await api.post(AGENDAMIENTO_URL, data);
    return res.data;
  },

  obtenerAgendamientoPorFecha: async (fecha) => {
    const res = await api.get(`${AGENDAMIENTO_URL}/fecha/${fecha}`);
    return res.data;
  },

  obtenerAgendamientoPorId: async (id) => {
    const res = await api.get(`${AGENDAMIENTO_URL}/${id}`);
    return res.data;
  },

  actualizarAgendamiento: async (id, data) => {
    const res = await api.put(`${AGENDAMIENTO_URL}/${id}`, data);
    return res.data;
  },

  eliminarAgendamiento: async (id) => {
    const res = await api.delete(`${AGENDAMIENTO_URL}/${id}`);
    return res.data;
  },
};
