import React from "react";
import GeneralTable from "../../../../../components/GeneralTable";

export default function Usuario() {
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
			<GeneralTable title="Clientes" columns={columns} data={data} />
		</div>
	);
}
