import api from "./api";

export async function getUser() {
	try {
		const res = await api.get("/me/");

		return res.data.user;
	} catch (err) {
		console.error("Error al verificar usuario:", err);
		return null;
	}
}
