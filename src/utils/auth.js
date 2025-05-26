export async function getUser() {
  try {
    const res = await fetch('http://localhost:3000/api/me/', {
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