import {BASE_URL} from '../utils/api'

const USER_URL = `${BASE_URL}/usuarios`

export const userService = {
    crearUsuario: async (data) => {
        const res = await fetch(USER_URL,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return res.json();
    },

    listarUsuarios: async () => {
        const res = await fetch(USER_URL,{
            credentials: 'include'
        });
        return res.json();
    },

    listarUsuarioPorDocumento: async (documento) => {
    const res = await fetch(`${USER_URL}/${documento}`,{
        credentials: 'include'
    });
    return res.json();
  },

  eliminarUsuario: async (documento) => {
    const res = await fetch(`${USER_URL}/${documento}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    return res.json();
  },

  buscarUsuarioPorEmail: async (email) => {
    const res = await fetch(`${USER_URL}/email/${email}`,{
        credentials: 'include'
    });
    return res.json();
  }

}