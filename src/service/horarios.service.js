import api from "../utils/api";

const NOVEDADES_HORARIOS_URL = "/novedadeshorarios";

export const horariosService = {
  crearNovedadHorario: async (data) => {
    const res = await api.post(NOVEDADES_HORARIOS_URL, data);
    return res.data;
  },

  obtenerNovedadesHorarios: async () => {
    const res = await api.get(NOVEDADES_HORARIOS_URL);
    return res.data;
  },

  obtenerNovedadPorId: async (id) => {
    const res = await api.get(`${NOVEDADES_HORARIOS_URL}/${id}`);
    return res.data;
  },

  actualizarNovedadHorario: async (id, data) => {
    const res = await api.put(`${NOVEDADES_HORARIOS_URL}/${id}`, data);
    return res.data;
  },

  eliminarNovedadHorario: async (id) => {
    const res = await api.delete(`${NOVEDADES_HORARIOS_URL}/${id}`);
    return res.data;
  },

  obtenerNovedadesPorEmpleado: async (idEmpleado) => {
    const res = await api.get(`${NOVEDADES_HORARIOS_URL}/empleado/${idEmpleado}`);
    return res.data;
  },

  obtenerNovedadesPorFecha: async (fechaInicio, fechaFin) => {
    const res = await api.get(
      `${NOVEDADES_HORARIOS_URL}/fechas?inicio=${fechaInicio}&fin=${fechaFin}`
    );
    return res.data;
  },
};
