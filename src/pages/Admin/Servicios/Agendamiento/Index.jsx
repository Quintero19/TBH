import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../../components/sideBar";

export default function Usuario() {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await fetch("http://localhost:3000/api/logout/", {
				method: "POST",
				credentials: "include",
			});
			navigate("/login");
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
		}
	};

	return (
		<>
			<h1>Bienvenido al Agendamiento</h1>
			<button type="button" onClick={handleLogout}>
				Cerrar Sesión
			</button>
		</>
	);
}
