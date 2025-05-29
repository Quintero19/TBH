import { useCallback, useEffect, useState } from "react";

import GeneralTable from "../../../../components/GeneralTable";
import Sidebar from "../../../../components/sideBar";
import api from "../../../../utils/api";

const columns = [
	{ header: "ID", accessor: "Id_Proveedores" },
	{ header: "Tipo Proveedor", accessor: "Tipo_Proveedor" },
	{ header: "Documento / NIT", accessor: "doc" },
	{ header: "Nombre / Empresa", accessor: "nombre" },
	{ header: "Celular / Celular Empresa", accessor: "celular" },
	{ header: "Estado", accessor: "Estado" },
];

const transformData = (data) => {
	return data.map((item) => {
		const isEmpresa = item.Tipo_Proveedor === "Empresa";
		return {
			...item,
			doc: isEmpresa ? item.NIT : item.Documento,
			nombre: isEmpresa ? item.Nombre_Empresa : item.Nombre,
			celular: isEmpresa ? item.Celular_Empresa : item.Celular,
		};
	});
};

const Proveedores = () => {
	const [data, setData] = useState([]);

	const fetchData = useCallback(async () => {
		try {
			const response = await api.get("/proveedores");
			console.log(response.data);
			setData(transformData(response.data.data));
		} catch (error) {
			console.error(
				"Error al obtener proveedores:",
				error.response?.data || error,
			);
			if (error.response?.status === 401) {
				handleLogout();
			}
		}
	}, []);

	const handleToggleEstado = async (id) => {
		try {
			await api.put(`/proveedores/estado/${id}`);
			await fetchData();
		} catch (error) {
			console.error("Error cambiando estado:", error);
			alert("Error cambiando estado");
		}
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleAdd = () => {
		console.log("Agregar proveedor");
	};

	const handleView = (row) => {
		console.log("Ver proveedor:", row);
	};

	const handleEdit = (row) => {
		console.log("Editar proveedor:", row);
	};

	const handleDelete = (row) => {
		console.log("Eliminar proveedor:", row);
	};

	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1 md:ml-64 p-4 md:p-8">
				<GeneralTable
					title="Proveedores"
					columns={columns}
					data={data}
					onAdd={handleAdd}
					onView={handleView}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onToggleEstado={handleToggleEstado}
					idAccessor="Id_Proveedores"
					stateAccessor="Estado"
				/>
			</div>
		</div>
	);
};

export default Proveedores;
