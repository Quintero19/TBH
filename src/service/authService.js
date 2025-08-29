import api from "../utils/api";

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/me");
    return res.data.user;            
  } catch (err) {
    if (err.response?.status === 401) {
      return null; 
    }
    console.error("Error al verificar usuario:", err);
    return null;
  }
};