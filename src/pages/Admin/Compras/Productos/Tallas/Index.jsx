import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { catProductoService } from "@/service/categoriaProducto.service";
import { tallasService } from "@/service/tallas.service";

const Tallas = () => {

	const [categorias, setCategorias] = useState([]);
	const [tallas, setTallas] = useState([]);
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Tallas" },
		{ header: "Categoria de Producto", accessor: "NombreCategoria" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ────────── Cargar Tallas ────────── */

	const fetchTallas = useCallback(async (categoriasData) => {
		try {
			const response = await tallasService.obtenerTallas();
			setTallas(transformData(response.data, categoriasData));
		} catch (error) {
			console.error( "Error al obtener las tallas:", error.response?.data || error);
		}
	}, []);

	useEffect(() => {
		const fetchCategorias = async () => {
			try {
				const response = await catProductoService.obtenerCategorias();
				setCategorias(response.data);
				await fetchTallas(response.data);
			} catch (error) {
				console.error("Error al obtener categorías:", error.response?.data || error);
			}
		};
		fetchCategorias();
	}, [fetchTallas]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista, listacategorias) => lista.map((item) => {
			const categoria = listacategorias.find(
				(c) => c.Id_Categoria_Producto === item.Id_Categoria_Producto,
			);
			return {
				...item,
				NombreCategoria: categoria?.Nombre || "Desconocido",
			};
		}), [],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		try {
			await tallasService.actualizarEstadoTalla(id);
			await fetchTallas();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/tallas/agregar");
	};

	
	/* ──────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (talla) => {
		try {
			const html = `
							<div class="text-left">
								<p><strong>Categoria Producto:</strong> ${talla.NombreCategoria || "-"}</p>
								<p><strong>Nombre:</strong> ${talla.Nombre || "-"}</p>
								<p><strong>Estado:</strong> ${talla.Estado ? "Activo" : "Inactivo"}</p>
							</div>
			`
			await showAlert(html, {
				title: `Detalles Talla ID: ${talla.Id_Tallas}`,
				type: "info",
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				}
			});
		} catch (error) {
			console.error("Error al obtener la talla:", error);
			showAlert(`No se pudieron cargar los detalles de la talla:${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ──────────── Ir a Editar ─────────── */

	const handleEdit = (talla) => {
		navigate(`/admin/tallas/editar/${talla.Id_Tallas}`);
	};

	/* ───────────────────────────────────── */

	/* ───────────── Eliminar ───────────────*/

	const handleDelete = async (talla) => {
		const result = await window.showAlert(
			`¿Deseas Eliminar la Talla <strong>${talla.Nombre}</strong>?`,
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
				await tallasService.eliminarTalla(talla.Id_Tallas);

				await  window.showAlert("Talla eliminada correctamente",{
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchTallas(categorias);
			} catch (error) {
				console.error("Error Eliminando Talla:", error);
				const mensaje = error.response?.data?.message || "Error al Eliminar la Talla";
				
				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};
	
	/* ───────────────────────────────────── */

	/* ───────── Volver a Productos ──────── */

	const returnProductos = () => {
		navigate("/admin/productos");
	};

	/* ───────────────────────────────────── */

	return (
		<GeneralTable
			title="Tallas"
			columns={columns}
			data={tallas}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Tallas"
			stateAccessor="Estado"
			return={returnProductos}
		/>
	);
};

export default Tallas;
