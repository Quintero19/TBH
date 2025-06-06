import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { catProductoService } from "../../../../service/categoriaProducto.service";

const columns = [
	{ header: "ID", accessor: "Id_Categoria_Producto" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Descripción", accessor: "Descripcion" },
	{ header: "Es Ropa?", accessor: "Es_Ropa" },
	{ header: "Estado", accessor: "Estado" },
];

const CategoriasProducto = () => {
	const [data, setData] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		try {
			const response = await catProductoService.obtenerCategorias();
			console.log(response);
			setData(response.data);
		} catch (error) {
			console.error(
				"Error al obtener las categorias:",
				error.response?.data || error,
			);
		}
	}, []);

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => ({
				...item,
				Es_Ropa: item.Es_Ropa ? "Si" : "No",
			})),
		[],
	);

	const filteredData = useMemo(() => {
		const transformed = transformData(data);
		const lowerSearch = searchTerm.toLowerCase();

		const matchEstado = (estado) => {
			if (["1", "activo"].includes(lowerSearch))
				return estado === true || estado === 1 || estado === "Activo";
			if (["0", "inactivo"].includes(lowerSearch))
				return estado === false || estado === 0 || estado === "Inactivo";
			return false;
		};

		return !searchTerm
			? transformed
			: transformed.filter((item) => {
					return (
						item.Id_Categoria_Producto?.toString().includes(lowerSearch) ||
						item.Nombre?.toLowerCase().includes(lowerSearch) ||
						item.Descripcion?.toLowerCase().includes(lowerSearch) ||
						item.Es_Ropa?.toLowerCase().includes(lowerSearch) ||
						matchEstado(item.Estado)
					);
				});
	}, [data, searchTerm]);

	const totalPages = Math.ceil(filteredData.length / itemsPerPage);

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredData.slice(start, start + itemsPerPage);
	}, [filteredData, currentPage, itemsPerPage]);

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleToggleEstado = async (id) => {
		try {
			await catProductoService.actualizarEstadoCategoria(id);
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
		navigate("/admin/categoriaproducto/agregar");
	};

	const handleVerDetalles = async (categoria) => {
		try {
			Swal.fire({
				title: `Detalles Cat.Producto ID: ${categoria.Id_Categoria_Producto}`,
				html: `
					<div class="text-left">
						<p><strong>Nombre:</strong> ${categoria.Nombre || "-"}</p>
						<p><strong>Descripción:</strong> ${categoria.Descripcion || "-"}</p>
						<p><strong>Es_Ropa?:</strong> ${categoria.Es_Ropa}</p>
						<p><strong>Estado:</strong> ${categoria.Estado ? "Activo" : "Inactivo"}</p>
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
			console.error("Error al obtener la categoria:", error);
			Swal.fire(
				"Error",
				"No se pudieron cargar los detalles de la categoria",
				"error",
			);
		}
	};

	const handleEdit = (categoria) => {
		navigate(
			`/admin/categoriaproducto/editar/${categoria.Id_Categoria_Producto}`,
		);
	};

	const handleDelete = async (categoria) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas Eliminar la Categoria de Producto "${categoria.Nombre}"?`,
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
				await catProductoService.eliminarCategoria(
					categoria.Id_Categoria_Producto,
				);

				await Swal.fire({
					title: "Eliminada",
					text: "Categoria eliminada correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});

				fetchData();
			} catch (error) {
				console.error("Error Eliminando Categoria:", error);
				const mensaje =
					error.response?.data?.message || "Error al Eliminar la Categoria";

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
			title="Categorias Producto"
			columns={columns}
			data={paginatedData}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Categoria_Producto"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
		/>
	);
};

export default CategoriasProducto;
