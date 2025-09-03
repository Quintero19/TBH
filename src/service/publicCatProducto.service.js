// services/publicCatProducto.service.js
import api from "../utils/api";

const PUBLIC_URL = "/categoria-producto/public";

export const publicCatProductoService = {
  obtenerCategoriasActivas: async () => {
    const res = await api.get(`${PUBLIC_URL}/activas`);
    return res.data;
  }
};