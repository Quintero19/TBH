import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { userService } from "../../../../service/usuario.service";

export default function Usuario() {
	const navigate = useNavigate();
	const title = "Gestion De Usuarios";
	const canEdit = (usuario) => usuario.Estado === true;
	const canDelete = (usuario) => usuario.Estado === true;

	const columns = [
		{ header: "Documento", accessor: "Documento" },
		{ header: "Correo", accessor: "Correo" },
		{ header: "Estado", accessor: "Estado" },
	];

	const [usuarios, setUsuarios] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	const obtenerUsuarios = useCallback(async () => {
		try {
			const response = await userService.listarUsuarios();

			const normalizado = response.data.map((usuario) => ({
				Documento: usuario.Documento,
				Correo: usuario.Correo,
				Estado: usuario.Estado,
				Id_Usuario: usuario.Id_Usuario,
				Rol_Id: usuario.Rol_Id,
			}));

			setUsuarios(normalizado);
		} catch (error) {
			console.error("Error al obtener los usuarios:", error);
		}
	}, []);

	const filteredData = useMemo(() => {
		if (!searchTerm) return usuarios;

		const lowerSearch = searchTerm.toLowerCase();

		return usuarios.filter((usuario) => {
			const docMatch = usuario.Documento?.toLowerCase().includes(lowerSearch);
			const correoMatch = usuario.Correo?.toLowerCase().includes(lowerSearch);
			const rolMatch = usuario.Rol_Id?.toString().includes(lowerSearch);

			let estadoMatch = false;
			if (lowerSearch === "1" || lowerSearch === "activo") {
				estadoMatch =
					usuario.Estado === true ||
					usuario.Estado === 1 ||
					usuario.Estado === "Activo";
			} else if (lowerSearch === "0" || lowerSearch === "inactivo") {
				estadoMatch =
					usuario.Estado === false ||
					usuario.Estado === 0 ||
					usuario.Estado === "Inactivo";
			}

			return docMatch || correoMatch || estadoMatch || rolMatch;
		});
	}, [usuarios, searchTerm]);

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
			await userService.actualizarEstadoUsuario(id);
			await obtenerUsuarios();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	const handleDelete = async (usuario) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al usuario con documento "${usuario.Documento}"?`,
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
				await userService.eliminarUsuario(usuario.Id_Usuario);
				await Swal.fire({
					title: "Eliminado",
					text: "Usuario eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
				await obtenerUsuarios();
			} catch (error) {
				console.error("Error al eliminar el usuario:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo eliminar el usuario",
					icon: "error",
					timer: 2500,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
			}
		}
	};

	const handleVerDetalles = (usuario) => {
		Swal.fire({
			title: "Detalles del Usuario",
			html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${usuario.Id_Usuario}</p>
          <p><strong>Documento:</strong> ${usuario.Documento}</p>
          <p><strong>Correo:</strong> ${usuario.Correo}</p>
          <p><strong>Estado:</strong> ${usuario.Estado ? "Activo" : "Inactivo"}</p>
          <p><strong>Rol:</strong> ${usuario.Rol_Id}</p>
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

	const handleEdit = (usuario) => {
		navigate(`/admin/usuario/editar/${usuario.Id_Usuario}`);
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	useEffect(() => {
		obtenerUsuarios();
	}, [obtenerUsuarios]);

	return (
		<GeneralTable
			title={title}
			columns={columns}
			data={paginatedData}
			onAdd={() => navigate("/admin/usuario/agregar")}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Usuario"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
			canEdit={canEdit}
			canDelete={canDelete}
		/>
	);
}
