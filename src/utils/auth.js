import {BASE_URL} from '../utils/api'

export async function getUser() {
  try {
    const res = await fetch(`${BASE_URL}/me/`, {
      method: 'GET',
      credentials: 'include' 
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error('Error al verificar usuario:', err);
    return null;
  }
}