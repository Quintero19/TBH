import { React, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "../../../../components/GeneralTable";
import { catProductoService } from "../../../../service/categoriaProducto.service";

const CategoriasProducto = () => {
	const [catsproducto, setCatsProducto] = useState([]);
	const navigate = useNavigate();
	const canEdit = (categoria) => categoria.Estado === true;
	const canDelete = (categoria) => categoria.Estado === true;	

	
	const columns = [
		{ header: "ID", accessor: "Id_Categoria_Producto" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Descripción", accessor: "Descripcion" },
		{ header: "Es Ropa?", accessor: "Es_Ropa" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ──────── Cargar Categorias ──────── */

	const fetchCatsProducto = useCallback(async () => {
		try {
			const response = await catProductoService.obtenerCategorias();
			setCatsProducto(transformData(response.data));
		} catch (error) {
			console.error(
				"Error al obtener las categorias:",
				error.response?.data || error,
			);
		}
	}, []);

	useEffect(() => {
		fetchCatsProducto();
	}, [fetchCatsProducto]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => ({
				...item,
				Es_Ropa: item.Es_Ropa ? "Si" : "No",
			})),
		[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		try {
			await catProductoService.actualizarEstadoCategoria(id);
			await fetchCatsProducto();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/categoriaproducto/agregar");
	};

	/* ─────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (categoria) => {
		try {
			const html =`
							<div class="text-left">
								<p><strong>Nombre:</strong> ${categoria.Nombre || "-"}</p>
								<p><strong>Descripción:</strong> ${categoria.Descripcion || "-"}</p>
								<p><strong>Es_Ropa?:</strong> ${categoria.Es_Ropa}</p>
								<p><strong>Estado:</strong> ${categoria.Estado ? "Activo" : "Inactivo"}</p>
							</div>
			`;
			await showAlert(html, {
				title: `Detalles Cat.Producto ID: ${categoria.Id_Categoria_Producto}`,
				type: "info",
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				}
			});
		} catch (error) {
			console.error("Error al obtener la categoria:", error);
			showAlert(`No se pudieron cargar los detalles de la categoria: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ──────────── Ir a Editar ─────────── */

	const handleEdit = (categoria) => {
		navigate(
			`/admin/categoriaproducto/editar/${categoria.Id_Categoria_Producto}`,
		);
	};

	/* ──────────────────────────────────── */

	/* ───────────── Eliminar ───────────────*/

	const handleDelete = async (categoria) => {
		const result = await window.showAlert(
			`¿Deseas eliminar la categoria <strong>"${categoria.Nombre}"</strong>?`,
			{
				type: "warning",
				title: "¿Estás seguro?",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: "Sí, eliminar",
				cancelButtonText: "Cancelar",
			}
		);

		if (result.isConfirmed) {
			try {
				await catProductoService.eliminarCategoria(categoria.Id_Categoria_Producto);

				await window.showAlert("Categoria eliminada correctamente",{
					title: "Eliminada",
					type: "success",
					duration: 2000,
				});

				fetchCatsProducto();
			} catch (error) {
				console.error("Error Eliminando Categoria:", error);
				const mensaje = error.response?.data?.message || "Error al Eliminar la Categoria";

				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};

	/* ──────────────────────────────────── */

	return (
		<GeneralTable
			title="Categorias Producto"
			columns={columns}
			data={catsproducto}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Categoria_Producto"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}	
		/>
	);
};

export default CategoriasProducto;
