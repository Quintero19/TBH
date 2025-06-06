import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { catProductoService } from "../../../../service/categoriaProducto.service";
import { productoService } from "../../../../service/productos.service";

const columns = [
	{ header: "ID", accessor: "Id_Productos" },
	{ header: "Categoria Producto", accessor: "NombreCategoria" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Precio de Venta", accessor: "Precio_Venta" },
	{ header: "Stock Disponible", accessor: "Stock" },
	{ header: "Estado", accessor: "Estado" },
];

const Productos = () => {
	const [data, setData] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		try {
			const response = await productoService.obtenerProductoss();
			console.log(response);
			setData(response.data);
		} catch (error) {
			console.error(
				"Error al obtener productos:",
				error.response?.data || error,
			);
		}
	}, []);

	const fetchCategorias = useCallback(async () => {
		try {
			const response = await catProductoService.obtenerCategorias();
			setCategorias(response.data);
		} catch (error) {
			console.error(
				"Error al obtener categorías:",
				error.response?.data || error,
			);
		}
	}, []);

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => {
				const categoria = categorias.find(
					(c) => c.Id_Categoria_Producto === item.Id_Categoria_Producto,
				);
				return {
					...item,
					NombreCategoria: categoria?.Nombre || "Desconocido",
					Precio_Venta: Number(item.Precio_Venta).toFixed(0),
					Precio_Compra: Number(item.Precio_Compra).toFixed(0),
				};
			}),
		[categorias],
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
						item.Id_Productos?.toString().toLowerCase().includes(lowerSearch) ||
						item.NombreCategoria?.toString()
							.toLowerCase()
							.includes(lowerSearch) ||
						item.Nombre?.toLowerCase().includes(lowerSearch) ||
						item.Precio_Venta?.toString().toLowerCase().includes(lowerSearch) ||
						item.Stock?.toString().toLowerCase().includes(lowerSearch) ||
						matchEstado(item.Estado)
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
			await productoService.actualizarEstadoProducto(id);
			await fetchData();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	useEffect(() => {
		fetchCategorias();
		fetchData();
	}, [fetchCategorias, fetchData]);

	const handleAdd = () => {
		navigate("/admin/productos/agregar");
	};

	const handleVerDetalles = async (producto) => {
		try {
			Swal.fire({
				title: `Detalles Producto ID: ${producto.Id_Productos}`,
				html: `
				<div class="text-left">
					<p><strong>Categoria de Producto:</strong> ${producto.Id_Categoria_Producto || "-"}</p>
					<p><strong>Nombre:</strong> ${producto.Nombre || "-"}</p>
					<p><strong>Precio de Venta:</strong> ${producto.Precio_Venta || "-"}</p>
					<p><strong>Precio de Compra:</strong> ${producto.Precio_Compra || "-"}</p>
					<p><strong>Stock:</strong> ${producto.Stock || "-"}</p>
					<p><strong>Estado:</strong> ${producto.Estado ? "Activo" : "Inactivo"}</p>
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
			console.error("Error al obtener el producto:", error);
			Swal.fire(
				"Error",
				"No se pudieron cargar los detalles del producto",
				"error",
			);
		}
	};

	const handleEdit = (producto) => {
		navigate(`/admin/productos/editar/${producto.Id_Productos}`);
	};

	const handleDelete = async (producto) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al producto "${producto.Nombre}"?`,
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
				await productoService.eliminarProducto(producto.Id_Productos);

				await Swal.fire({
					title: "Eliminado",
					text: "Producto eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});

				fetchData();
			} catch (error) {
				console.error("Error Eliminando Producto:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el producto";

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

	const handleTallas = () => {
		navigate("/admin/tallas");
	};
	const handleTamanos = () => {
		navigate("/admin/tamanos");
	};

	return (
		<GeneralTable
			title="Productos"
			columns={columns}
			data={paginatedData}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Productos"
			stateAccessor="Estado"
			searchTerm={searchTerm}
			onSearchChange={handleSearchChange}
			currentPage={currentPage}
			totalPages={totalPages}
			onPageChange={handlePageChange}
			goTallas={handleTallas}
			goTamanos={handleTamanos}
		/>
	);
};

export default Productos;
