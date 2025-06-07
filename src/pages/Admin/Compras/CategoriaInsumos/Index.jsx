import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const pageSize = 5;

/**
 * Definición de columnas para la tabla general, con
 * encabezados y claves de acceso a los datos.
 */
const columns = [
	{ header: "ID", accessor: "Id_Categoria_Insumos" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Descripción", accessor: "Descripcion" },
	{ header: "Estado", accessor: "Estado" },
];

/**
 * Componente principal para administrar categorías de insumos
 */
const CategoriaInsumoAdmin = () => {
	const [categorias, setCategorias] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	/**
	 * Función para cargar categorías desde el servicio.
	 * Se usa useCallback para memorizar la función y evitar
	 * recargas innecesarias.
	 */
	const cargarCategorias = useCallback(async () => {
		try {
			setError(null);
			const response = await categoriaInsumoService.obtenerCategorias();
			setCategorias(response.data);
		} catch (err) {
			console.error(err);
			setError("Error al cargar categorías.");
		}
	}, []);

	/**
	 * Hook useEffect que carga las categorías al montar el componente
	 * y cuando la función `cargarCategorias` cambia (no debería).
	 */
	useEffect(() => {
		cargarCategorias();
	}, [cargarCategorias]);

	/**
	 * Función para cambiar el estado activo/inactivo de una categoría.
	 * Busca la categoría en el estado, cambia el estado llamando al servicio
	 * y vuelve a cargar la lista actualizada.
	 */
	const toggleEstado = async (categoriaId) => {
		const categoria = categorias.find(
			(c) => c.Id_Categoria_Insumos === categoriaId,
		);
		if (!categoria) return;

		try {
			await categoriaInsumoService.actualizarEstadoCategoria(
				categoriaId,
				!categoria.Estado,
			);
			await cargarCategorias();
		} catch (err) {
			console.error(err);
			alert("Error al cambiar el estado.");
		}
	};

	/**
	 * ---------------------------------------------------------------------
	 * -------------------- Agregar ----------------------------------------
	 * ---------------------------------------------------------------------
	 */

	const handleAdd = () => {
		navigate("/admin/categoriainsumo/agregar");
	};

	/*----------------------------------------------------------------------------------*/

	/**
	 * ---------------------------------------------------------------------
	 * -------------------- Editar ----------------------------------------
	 * ---------------------------------------------------------------------
	 */

	const handleEdit = (categoria) => {
		navigate(`/admin/categoriainsumo/editar/${categoria.Id_Categoria_Insumos}`);
	};

	/*----------------------------------------------------------------------------------*/

	/**
	 * ---------------------------------------------------------------------
	 * -------------------- Eliminar ----------------------------------------
	 * ---------------------------------------------------------------------
	 */

	const canDelete = (categoria) => {
		return !categoria.Insumos || categoria.Insumos.length === 0;
	};

	const handleDelete = async (categoria) => {
	try {
		const result = await showAlert(
		`¿Estás seguro que quieres eliminar la categoría "<strong>${categoria.Nombre}</strong>"? Esta acción no se puede deshacer.`,
		{
			type: "warning",
			title: "Confirmar eliminación",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		}
		);

		if (result.isConfirmed) {
		await categoriaInsumoService.eliminarCategoria(categoria.Id_Categoria_Insumos);

		await showAlert("Categoría eliminada correctamente.", {
			type: "success",
			title: "Éxito",
			duration: 2000,
		});

		cargarCategorias();
		}
	} catch (error) {
		const mensaje =
		error?.response?.data?.message ||
		"No se pudo eliminar la categoría. Puede que tenga insumos asociados.";

		await showAlert(mensaje, {
		type: "error",
		title: "Error",
		showConfirmButton: true,
		confirmButtonText: "Cerrar",
		});
	}
	};

	
	/*----------------------------------------------------------------------------------*/

	/**
	 * Filtrado de categorías según el término de búsqueda.
	 * Soporta filtros especiales para "ACTIVO" e "INACTIVO" que filtran
	 * por estado booleano, o busca en nombre y descripción.
	 */
	const categoriasFiltradas = categorias.filter((cat) => {
		const search = searchTerm.trim().toUpperCase();

		if (search === "ACTIVO") return cat.Estado === true;
		if (search === "INACTIVO") return cat.Estado === false;

		const searchLower = searchTerm.trim().toLowerCase();
		return (
			cat.Nombre?.toLowerCase().includes(searchLower) ||
			cat.Descripcion?.toLowerCase().includes(searchLower)
		);
	});

	/**
	 * Cálculo del número total de páginas para la paginación,
	 * asegurando que sea al menos 1.
	 */
	const totalPages = Math.max(
		1,
		Math.ceil(categoriasFiltradas.length / pageSize),
	);

	/**
	 * Hook que resetea la página actual a 1 cuando cambia el término de búsqueda.
	 */
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm]);

	/**
	 * Se obtienen los datos de la página actual mediante slicing
	 * para la paginación.
	 */
	const paginatedCategorias = categoriasFiltradas.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	/**
	 * Función para mostrar detalles de una categoría en un modal alerta.
	 */
	const handleVerDetalles = async (categoria) => {
		try {
			const html = `
				<div class="text-left">
					<p><strong>ID:</strong> ${categoria.Id_Categoria_Insumos || "-"}</p>
					<p><strong>Nombre:</strong> ${categoria.Nombre || "-"}</p>
					<p><strong>Descripción:</strong> ${categoria.Descripcion || "-"}</p>
					<p><strong>Estado:</strong> ${categoria.Estado ? "Activo" : "Inactivo"}</p>
				</div>
			`;

			await showAlert(html, {
				type: "info",
				title: `Detalles Categoría ID: ${categoria.Id_Categoria_Insumos}`,
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			console.error(error);
			showAlert(`No se pudieron cargar los detalles: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/**
	 * Render del componente
	 **/
	return (
		<>
			{error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
			<GeneralTable
				title="Listado de Categorías"
				columns={columns}
				data={paginatedCategorias}
				onView={handleVerDetalles}
				onToggleEstado={toggleEstado}
				onAdd={handleAdd}
				onEdit={handleEdit}
				onDelete={handleDelete}
				canDelete={canDelete}
				idAccessor="Id_Categoria_Insumos"
				searchTerm={searchTerm}
				onSearchChange={(e) => setSearchTerm(e.target.value)}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={(_, page) => setCurrentPage(page)}
			/>
		</>
	);
};

export default CategoriaInsumoAdmin;
