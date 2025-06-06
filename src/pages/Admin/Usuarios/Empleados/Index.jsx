import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import Sidebar from "../../../../components/sideBar";
import { empleadoService } from "../../../../service/empleado.service";

const columns = [
	{ header: "Documento", accessor: "Documento" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Celular", accessor: "Celular" },
	{ header: "Estado", accessor: "Estado" },
];

const Empleados = () => {
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		try {
			const response = await empleadoService.obtenerEmpleados();
			console.log("Datos empleados API:", response.data);
			setData(response.data);
		} catch (error) {
			console.error(
				"Error al obtener empleados:",
				error.response?.data || error,
			);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const filteredData = useMemo(() => {
		if (!searchTerm) return data;
		const lowerSearch = searchTerm.toLowerCase();

		return data.filter((item) => {
			const documentoMatch = item.Documento?.toString()
				.toLowerCase()
				.includes(lowerSearch);
			const nombreMatch = item.Nombre?.toLowerCase().includes(lowerSearch);
			const celularMatch = item.Celular?.toString()
				.toLowerCase()
				.includes(lowerSearch);

			const estadoMatch =
				(lowerSearch === "activo" &&
					(item.Estado === true || item.Estado === 1)) ||
				(lowerSearch === "inactivo" &&
					(item.Estado === false || item.Estado === 0));

			return documentoMatch || nombreMatch || celularMatch || estadoMatch;
		});
	}, [data, searchTerm]);

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);
	const paginatedData = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleToggleEstado = async (id) => {
		try {
			await empleadoService.actualizarEstadoEmpleado(id);
			await fetchData();
		} catch (error) {
			console.error("Error actualizando estado:", error);
		}
	};

	const handleAdd = () => {
		navigate("/admin/empleado/agregar");
	};

	const handleVerDetalles = (empleado) => {
		Swal.fire({
			title: `Empleado: ${empleado.Nombre}`,
			html: `
        <p><strong>Documento:</strong> ${empleado.Documento}</p>
        <p><strong>Celular:</strong> ${empleado.Celular}</p>
        <p><strong>Estado:</strong> ${empleado.Estado === true || empleado.Estado === 1 ? "Activo" : "Inactivo"}</p>
      `,
			icon: "info",
			confirmButtonText: "Cerrar",
			background: "#000",
			color: "#fff",
		});
	};

	const handleEdit = (empleado) => {
		navigate(`/admin/empleado/editar/${empleado.Id_Empleados}`);
	};

	const handleDelete = async (empleado) => {
		console.log("Empleado a eliminar:", empleado);
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al empleado "${empleado.Nombre}"?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
			background: "#000",
			color: "#fff",
		});

		if (result.isConfirmed) {
			try {
				await empleadoService.eliminarEmpleado(empleado.Id_Empleados);
				await Swal.fire({
					title: "Eliminado",
					text: "Empleado eliminado correctamente",
					icon: "success",
					timer: 1000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
				fetchData();
			} catch (error) {
				console.error("Error al eliminar empleado:", error);
				Swal.fire({
					title: "Error",
					text: error.response?.data?.message || "No se pudo eliminar",
					icon: "error",
					timer: 2500,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
			}
		}
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	return (
		<GeneralTable
			title="Empleados"
			columns={columns}
			data={paginatedData}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Empleados"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
		/>
	);
};

export default Empleados;
