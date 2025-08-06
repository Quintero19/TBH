import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
		} catch (error) {
					const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
						showAlert(`Error: ${mensaje || error}`, {
								duration: 2500,
								title: "Error",
								icon: "error",
								didClose: () => {navigate(-1)},
							})
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
				},
			);

			if (result.isConfirmed) {
				await categoriaInsumoService.eliminarCategoria(
					categoria.Id_Categoria_Insumos,
				);

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
	 * Función para mostrar detalles de una categoría en un modal alerta.
	 */
	const handleVerDetalles = async (categoria) => {
		try {
			const html = `
		<div class="space-y-7 text-gray-100">
			<!-- Encabezado -->
			<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
			<h3 class="text-xl font-bold text-white">Detalles de Categoría</h3>
			<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
				ID: ${categoria.Id_Categoria_Insumos ?? "N/A"}
			</span>
			</div>

			<!-- Campos -->
			<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
			<!-- Nombre -->
			<div class="relative">
				<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
				Nombre
				</label>
				<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
				<div class="font-medium text-white">${categoria.Nombre ?? "-"}</div>
				</div>
			</div>

			<!-- Estado -->
			<div class="relative">
				<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
				Estado
				</label>
				<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
					categoria.Estado
						? "bg-[#112d25] border-emerald-500/30"
						: "bg-[#2c1a1d] border-rose-500/30"
				}">
				<div class="font-medium ${
					categoria.Estado ? "text-emerald-300" : "text-rose-300"
				}">
					${categoria.Estado ? "Activo" : "Inactivo"}
				</div>
				</div>
			</div>

			<!-- Descripción -->
			<div class="relative md:col-span-2">
				<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
				Descripción
				</label>
				<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
				<div class="text-gray-200 ${!categoria.Descripcion ? "italic text-gray-400" : ""}">
					${categoria.Descripcion || "No hay descripción disponible"}
				</div>
				</div>
			</div>
			</div>
		</div>
		`;

			await showAlert(html, {
				title: "",
				width: "640px",
				background: "#111827",
				color: "#ffffff",
				padding: "1.5rem",
				confirmButtonText: "Cerrar",
				confirmButtonColor: "#4f46e5",
				customClass: {
					popup: "rounded-xl shadow-2xl border border-gray-700/50",
					confirmButton: "px-6 py-2 font-medium rounded-lg mt-4",
				},
			});
		} catch (error) {
			console.error(error);
			await showAlert(`Error: ${error.message || error}`, {
				title: "Error",
				icon: "error",
				background: "#1f2937",
				color: "#ffffff",
				width: "500px",
				confirmButtonColor: "#dc2626",
			});
		}
	};

	/**
	 * Función para determinar si una categoría puede ser eliminada.
	 * Una categoría puede ser eliminada si no tiene insumos asociados.
	 **/

	const canEdit = (categoria) => categoria.Estado === true;

	/**
	 * Función para determinar si una categoría puede ser eliminada.
	 * Una categoría puede ser eliminada si no tiene insumos asociados.
	 **/

	const canDelete = (categoria) => {
		const tieneInsumos = categoria.Insumos && categoria.Insumos.length > 0;
		const estaDesactivada = categoria.Estado === false;
		return !(tieneInsumos || estaDesactivada);
	};

	/**
	 * Render del componente
	 **/
	return (
		<>
			{error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
			<GeneralTable
				title="Categorías de Insumos"
				columns={columns}
				data={categorias}
				onView={handleVerDetalles}
				onToggleEstado={toggleEstado}
				onAdd={handleAdd}
				onEdit={handleEdit}
				onDelete={handleDelete}
				canDelete={canDelete}
				canEdit={canEdit}
				idAccessor="Id_Categoria_Insumos"
			/>
		</>
	);
};

export default CategoriaInsumoAdmin;
