import { React, useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import GeneralTable from "../../../../../components/GeneralTable";
import { clienteService } from "../../../../../service/clientes.service";

export default function Clientes() {
	const navigate = useNavigate();
	const title = "Clientes";

	const columns = [
		{ header: "Documento", accessor: "Documento" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Correo", accessor: "Correo" },
		{ header: "Estado", accessor: "Estado" },
	];

	const [clientes, setClientes] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	const obtenerClientes = useCallback(async () => {
		try {
			const response = await clienteService.listarClientes();

			const normalizado = response.data.map((cliente) => ({
				Id_Cliente: cliente.Id_Cliente,
				Documento: cliente.Documento,
				Nombre: cliente.Nombre,
				Correo: cliente.Correo,
				Estado: cliente.Estado,
			}));

			setClientes(normalizado);
		} catch (error) {
			console.error("Error al obtener los clientes:", error);
		}
	}, []);

	const filteredData = useMemo(() => {
		if (!searchTerm) return clientes;

		const lowerSearch = searchTerm.toLowerCase();

		return clientes.filter((cliente) => {
			const docMatch = cliente.Documento?.toString().includes(lowerSearch);
			const correoMatch = cliente.Correo?.toLowerCase().includes(lowerSearch);
			const nombreMatch = cliente.Nombre?.toLowerCase().includes(lowerSearch);

			let estadoMatch = false;
			if (lowerSearch === "1" || lowerSearch === "activo") {
				estadoMatch = cliente.Estado === true || cliente.Estado === 1 || cliente.Estado === "Activo";
			} else if (lowerSearch === "0" || lowerSearch === "inactivo") {
				estadoMatch = cliente.Estado === false || cliente.Estado === 0 || cliente.Estado === "Inactivo";
			}

			return docMatch || correoMatch || nombreMatch || estadoMatch;
		});
	}, [clientes, searchTerm]);

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
			await clienteService.actualizarEstadoCliente(id);
			await obtenerClientes();
		} catch (error) {
			console.error("Error cambiando estado del cliente:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	const handleDelete = async (cliente) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al cliente con documento "${cliente.Documento}"?`,
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
				await clienteService.eliminarCliente(cliente.Id_Cliente);
				await Swal.fire({
					title: "Eliminado",
					text: "Cliente eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
				await obtenerClientes();
			} catch (error) {
				console.error("Error al eliminar el cliente:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo eliminar el cliente",
					icon: "error",
					timer: 2500,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
			}
		}
	};

	const handleVerDetalles = (cliente) => {
		Swal.fire({
			title: "Detalles del Cliente",
			html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${cliente.Id_Cliente}</p>
          <p><strong>Documento:</strong> ${cliente.Documento}</p>
          <p><strong>Nombre:</strong> ${cliente.Nombre}</p>
          <p><strong>Correo:</strong> ${cliente.Correo}</p>
          <p><strong>Estado:</strong> ${cliente.Estado ? "Activo" : "Inactivo"}</p>
        </div>
      `,
			icon: "info",
			confirmButtonText: "Cerrar",
			padding: "1rem",
			confirmButtonColor: "#3085d6",
			background: "#000",
			color: "#fff",
		});
	};

	const handleEdit = (cliente) => {
		navigate(`/admin/clientes/editar/${cliente.Id_Cliente}`);
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	useEffect(() => {
		obtenerClientes();
	}, [obtenerClientes]);

	return (
		<GeneralTable
			title={title}
			columns={columns}
			data={paginatedData}
			onAdd={() => navigate("/admin/clientes/agregar")}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Cliente"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
		/>
	);
}
