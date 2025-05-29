import React from "react";
import { useNavigate } from "react-router-dom";
import GeneralTable from "../../../../components/GeneralTable";
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

	const columns = [
		{ header: "Documento", accessor: "documento" },
		{ header: "Nombre", accessor: "nombre" },
		{ header: "Apellido", accessor: "apellido" },
		{ header: "Correo", accessor: "correo" },
		{ header: "Estado", accessor: "estado" },
	];

	const data = [];

	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1 md:ml-64 p-4 md:p-8">
				<GeneralTable
					title="Clientes"
					columns={columns}
					data={data}
					// onAdd={handleAdd}
					// onView={handleView}
					// onEdit={handleEdit}
					// onDelete={handleDelete}
					// onToggleEstado={handleToggleEstado}
					// idAccessor="Id_Proveedores"
					// stateAccessor="Estado"
				/>
			</div>
		</div>
	);
}
