import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { servicioService } from "../../../../service/serviciosService";
const columns = [
	{ header: "Id_Servicios", accessor: "Id_Servicios" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Precio", accessor: "Precio" },
	{ header: "Duracion ", accessor: "Duracion" },
	{ header: "Estado", accessor: "Estado" },
];

const transformData = (data) => {
	return data.map((item) => {
		return {
			...item,
			Precio: item.Precio != null ? Math.floor(item.Precio) : "-",
		};
	});
};

const Servicios = () => {
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		try {
			const response = await servicioService.obtenerServicios();
			console.log(response);
			setData(transformData(response.data));
		} catch (error) {
			console.error(
				"Error al obtener Servicios:",
				error.response?.data || error,
			);
		}
	}, []);

	const filteredData = useMemo(() => {
		if (!searchTerm) return data;

		const lowerSearch = searchTerm.toLowerCase();

		return data.filter((item) => {
			const idMatch = item.Id_Servicios.toString().includes(lowerSearch);
			const nombreMatch = item.Nombre?.toLowerCase().includes(lowerSearch);
			const duracionMatch = item.Duracion;
			const precioMatch = item.Precio;

			let estadoMatch = false;
			if (lowerSearch === "1" || lowerSearch === "activo") {
				estadoMatch =
					item.Estado === true || item.Estado === 1 || item.Estado === "Activo";
			} else if (lowerSearch === "0" || lowerSearch === "inactivo") {
				estadoMatch =
					item.Estado === false ||
					item.Estado === 0 ||
					item.Estado === "Inactivo";
			}

			return (
				idMatch || nombreMatch || precioMatch || duracionMatch || estadoMatch
			);
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
			await servicioService.actualizarEstadoServicios(id);
			await fetchData();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleAdd = () => {
		navigate("/admin/servicios/agregar"); //cambiar ruta
	};

	const handleVerDetalles = async (Servicios) => {
		try {
			Swal.fire({
				title: `Detalles Servicio ID: ${Servicios.Id_Servicios}`,
				html: `
          <div class="text-left">
            <p><strong>nombre :</strong> ${Servicios.Nombre || "-"}</p>
            <p><strong>precio:</strong> ${Servicios.Precio != null ? Math.floor(Servicios.Precio) : "-"}</p>
            <p><strong>Duracion:</strong> ${Servicios.Duracion} min</p>
            <p><strong>Descripcion:</strong> ${Servicios.Descripcion || "-"}</p>
            <p><strong>Estado:</strong> ${Servicios.Estado ? "Activo" : "Inactivo"}</p>
          </div>
      `,
				icon: "info",
				confirmButtonText: "Cerrar",
				padding: "1rem",
				confirmButtonColor: "#3085d6",
				background: "#000",
				color: "#fff",
			});
		} catch (error) {
			console.error("Error al obtener el Servicios:", error);
			Swal.fire(
				"Error",
				"No se pudieron cargar los detalles del Servicios",
				"error",
			);
		}
	};

	const handleEdit = (Servicios) => {
		navigate(`/admin/servicios/editar/${Servicios.Id_Servicios}`); // cambiar ruta
	};

	const handleDelete = async (Servicios) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al Servicio "${Servicios.Nombre}"?`,
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
				await servicioService.eliminarServicios(Servicios.Id_Servicios);

				await Swal.fire({
					title: "Eliminado",
					text: "Servicios eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});

				fetchData();
			} catch (error) {
				console.error("Error Eliminando Servicios:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el Servicios";

				Swal.fire({
					title: "Error",
					text: mensaje,
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
		<>
			<GeneralTable
				title="Servicios"
				columns={columns}
				data={paginatedData}
				onAdd={handleAdd}
				onView={handleVerDetalles}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleEstado={handleToggleEstado}
				idAccessor="Id_Servicios"
				stateAccessor="Estado"
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={handlePageChange}
			/>
		</>
	);
};

export default Servicios;
