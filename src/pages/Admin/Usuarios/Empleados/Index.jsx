import React from "react";
import GeneralTable from "../../../../components/GeneralTable";
import Sidebar from "../../../../components/sideBar";

export default function Usuario() {
	const title = "Empleados";

	const columns = [
		{ header: "Documento", accessor: "documento" },
		{ header: "Nombre", accessor: "nombre" },
		{ header: "Apellido", accessor: "apellido" },
		{ header: "Correo", accessor: "correo" },
		{ header: "Estado", accessor: "estado" },
	];

	const data = [];

	return (
		<>
			<Sidebar />
			<div className="flex-1 md:ml-64 p-4 md:p-8">
				<GeneralTable
					title={title}
					columns={columns}
					data={data}
					onAdd={() => console.log("Agregar")}
					onView={(row) => console.log("Ver", row)}
					onEdit={(row) => console.log("Editar", row)}
					onDelete={(row) => console.log("Eliminar", row)}
				/>
			</div>
		</>
	);
}
