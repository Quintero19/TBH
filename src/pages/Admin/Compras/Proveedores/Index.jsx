import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { proveedorService } from "../../../../service/proveedores.service";

const columns = [
	{ header: "ID", accessor: "Id_Proveedores" },
	{ header: "Tipo Proveedor", accessor: "Tipo_Proveedor" },
	{ header: "Nombre / Empresa", accessor: "nombre" },
	{ header: "Celular / Celular Empresa", accessor: "celular" },
	{ header: "Email", accessor: "Email" },
	{ header: "Estado", accessor: "Estado" },
];

const Proveedores = () => {
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		try {
			const response = await proveedorService.obtenerProveedores();
			console.log(response);
			setData(transformData(response.data));
		} catch (error) {
			console.error("Error al obtener proveedores:", error.response?.data || error);
		}
	}, []);

	const transformData = useCallback(
		(data) =>
			data.map((item) => {
				const isEmpresa = item.Tipo_Proveedor === "Empresa";
				return {
					...item,
					nombre: isEmpresa ? item.Nombre_Empresa : item.Nombre,
					celular: isEmpresa ? item.Celular_Empresa : item.Celular,
				};
			}), []
	);

	const filteredData = useMemo(() => {
		const transformed = transformData(data);
		const lowerSearch = searchTerm.toLowerCase();

		const matchEstado = (estado) => {
			if (["1", "activo"].includes(lowerSearch)) return estado === true || estado === 1 || estado === "Activo";
			if (["0", "inactivo"].includes(lowerSearch)) return estado === false || estado === 0 || estado === "Inactivo";
			return false;
		};

		return !searchTerm ? transformed : transformed.filter((item) => {
			return (
				item.Id_Proveedores?.toString().includes(lowerSearch) ||
				item.Tipo_Proveedor?.toLowerCase().includes(lowerSearch) ||
				item.nombre?.toLowerCase().includes(lowerSearch) ||
				item.celular?.toLowerCase().includes(lowerSearch) ||
				item.Email?.toLowerCase().includes(lowerSearch) ||
				matchEstado(item.Estado)
			);
		});
	}, [data, searchTerm]);

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);

	const paginatedData = filteredData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};


	const handleToggleEstado = async (id) => {
		try {
			await proveedorService.actualizarEstadoProveedor(id);
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
		navigate("/admin/proveedores/agregar");
	};

	const handleVerDetalles = async (proveedor) => {
		try {
			Swal.fire({
				title: `Detalles Proveedor ID: ${proveedor.Id_Proveedores}`,
				html: 
					`
					<div class="text-left">
						<p><strong>Tipo de Proveedor:</strong> ${proveedor.Tipo_Proveedor || "-"}</p>
							${
								proveedor.Tipo_Proveedor !== "Natural"?
									`
									<p><strong>NIT:</strong> ${proveedor.NIT}</p>
									<p><strong>Nombre de la Empresa:</strong> ${proveedor.Nombre_Empresa || "-"}</p>
									<p><strong>Celular de la Empresa:</strong> ${proveedor.Celular_Empresa || "-"}</p>
									<p><strong>Nombre Asesor:</strong> ${proveedor.Asesor || "-"}</p>
									<p><strong>Celular del Asesor:</strong> ${proveedor.Celular_Asesor || "-"}</p>
									` : `
									<p><strong>Tipo de Documento:</strong> ${proveedor.Tipo_Documento || "-"}</p> 
									<p><strong>Documento:</strong> ${proveedor.Documento || "-"}</p> 
									<p><strong>Nombre:</strong> ${proveedor.Nombre || "-"}</p>
									<p><strong>Celular:</strong> ${proveedor.Celular || "-"}</p
									`
							}
						<p></p>
						<p><strong>Correo:</strong> ${proveedor.Email || "-"}</p>
						<p><strong>Dirección:</strong> ${proveedor.Direccion || "-"}</p>
						<p><strong>Estado:</strong> ${proveedor.Estado ? "Activo" : "Inactivo"}</p>
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
			console.error("Error al obtener el proveedor:", error);
			Swal.fire(
				"Error",
				"No se pudieron cargar los detalles del proveedor",
				"error",
			);
		}
	};

	const handleEdit = (proveedor) => {
		navigate(`/admin/proveedores/editar/${proveedor.Id_Proveedores}`);
	};

	const handleDelete = async (proveedor) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al proveedor "${proveedor.Nombre}"?`,
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
				await proveedorService.eliminarProveedor(proveedor.Id_Proveedores);

				await Swal.fire({
					title: "Eliminado",
					text: "Proveedor eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});

				fetchData();
			} catch (error) {
				console.error("Error Eliminando Proveedor:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el proveedor";

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
		<GeneralTable
			title="Proveedores"
			columns={columns}
			data={paginatedData}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Proveedores"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
		/>
	);
};

export default Proveedores;
