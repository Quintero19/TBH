import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { rolService } from "../../../../service/roles.service";

export default function Rol() {
	const navigate = useNavigate();
	const title = "Roles";
	const canEdit = (roles) => roles.Estado === true;
	const canDelete = (roles) => roles.Estado === true;

	const columns = [
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Descripcion", accessor: "Descripcion" },
		{ header: "Estado", accessor: "Estado" },
	];

	const [roles, setRoles] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	const obtenerRoles = useCallback(async () => {
		try {
			const response = await rolService.listarRoles();

			const normalizado = response.data.map((rol) => ({
				Id: rol.Id,
				Nombre: rol.Nombre,
				Descripcion: rol.Descripcion,
				Estado: rol.Estado,
			}));

			setRoles(normalizado);
		} catch (error) {
			console.error("Error al obtener los roles:", error);
		}
	}, []);

	const filteredData = useMemo(() => {
		if (!searchTerm) return roles;

		const lowerSearch = searchTerm.toLowerCase();

		return roles.filter((rol) => {
			const nombreMatch = rol.Nombre?.toLowerCase().includes(lowerSearch);
			const descripcionMatch =
				rol.Descripcion?.toLowerCase().includes(lowerSearch);

			let estadoMatch = false;
			if (lowerSearch === "1" || lowerSearch === "activo") {
				estadoMatch =
					rol.Estado === true || rol.Estado === 1 || rol.Estado === "Activo";
			} else if (lowerSearch === "0" || lowerSearch === "inactivo") {
				estadoMatch =
					rol.Estado === false || rol.Estado === 0 || rol.Estado === "Inactivo";
			}

			return nombreMatch || descripcionMatch || estadoMatch;
		});
	}, [roles, searchTerm]);

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
			await rolService.cambiarEstadoRoles(id);
			await obtenerRoles();
		} catch (error) {
			console.error("Error cambiando estado:", error);
			alert("Error cambiando estado");
		}
	};

	const handleDelete = async (rol) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar el rol "${rol.Nombre}"?`,
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
				await rolService.eliminarRoles(rol.Id);
				await Swal.fire({
					title: "Eliminado",
					text: "Rol eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
				await obtenerRoles();
			} catch (error) {
				console.error("Error al eliminar el rol:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo eliminar el rol",
					icon: "error",
					timer: 2500,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
			}
		}
	};

	const handleVerDetalles = (rol) => {
		Swal.fire({
			title: "Detalles del Rol",
			html: `
        <div class="text-left">
          <p><strong>ID:</strong> ${rol.Id}</p>
          <p><strong>Nombre:</strong> ${rol.Nombre}</p>
          <p><strong>Descripción:</strong> ${rol.Descripcion}</p>
          <p><strong>Estado:</strong> ${rol.Estado ? "Activo" : "Inactivo"}</p>
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

	const handleEdit = (rol) => {
		navigate(`/admin/roles/editar/${rol.Id}`);
	};

	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	const handleAsignarPermisos = (rol) => {
		navigate(`/admin/roles/asignar/${rol.Id}`);
	};


	useEffect(() => {
		obtenerRoles();
	}, [obtenerRoles]);

	return (
		<GeneralTable
			title={title}
			columns={columns}
			data={paginatedData}
			onAdd={() => navigate("/admin/roles/agregar")}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
			canEdit={canEdit}
			canDelete={canDelete}
			onAssignPermissions={handleAsignarPermisos}
		/>
	);
}
