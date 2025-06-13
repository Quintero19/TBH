import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { catProductoService } from "@/service/categoriaProducto.service";
import { productoService } from "@/service/productos.service";

const Productos = () => {
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Productos" },
		{ header: "Categoria Producto", accessor: "NombreCategoria" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Precio de Venta", accessor: "Precio_Venta" },
		{ header: "Stock Disponible", accessor: "Stock" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ──────── Cargar Productos ───────── */

	const fetchProductos = useCallback(async (categoriasData) => {
		try {
			const response = await productoService.obtenerProductoss();
			setProductos(transformData(response.data, categoriasData));
		} catch (error) {
			console.error("Error al obtener productos:", error.response?.data || error);
		}
	}, []);

	useEffect(() => {
		const fetchCategorias = async () => {
			try {
				const response = await catProductoService.obtenerCategorias();
				setCategorias(response.data);
				await fetchProductos(response.data);
			} catch (error) {
				console.error("Error al cargar datos:", error.response?.data || error);
			}
		};

		fetchCategorias();
	}, [fetchProductos]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista, listacategorias) => lista.map((item) => {
			const categoria = listacategorias.find(
				(c) => c.Id_Categoria_Producto === item.Id_Categoria_Producto
			);
			return {
				...item,
				NombreCategoria: categoria?.Nombre || "Desconocido",
				Precio_Venta: Number(item.Precio_Venta).toFixed(0),
				Precio_Compra: Number(item.Precio_Compra).toFixed(0),
			};
		}),[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		try {
			await productoService.actualizarEstadoProducto(id);
			await fetchProductos();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/productos/agregar");
	};

	/* ──────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (producto) => {
		try {
			const html = `				
							<div class="text-left">
						<p><strong>Categoria de Producto:</strong> ${producto.NombreCategoria || "-"}</p>
						<p><strong>Nombre:</strong> ${producto.Nombre || "-"}</p>
						<p><strong>Precio de Venta:</strong> ${producto.Precio_Venta || "-"}</p>
						<p><strong>Precio de Compra:</strong> ${producto.Precio_Compra || "-"}</p>
						<p><strong>Stock:</strong> ${producto.Stock || "-"}</p>
						<p><strong>Estado:</strong> ${producto.Estado ? "Activo" : "Inactivo"}</p>
							</div>`
			await showAlert(html,{
				title: `Detalles Producto ID: ${producto.Id_Productos}`,
				type: "info",
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				}
			});
		} catch (error) {
			console.error("Error al obtener el producto:", error);
			showAlert(`No se pudieron cargar los detalles del producto: ${error}`,{
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ──────────── Ir a Editar ─────────── */

	const handleEdit = (producto) => {
		navigate(`/admin/productos/editar/${producto.Id_Productos}`);
	};

	/* ───────────────────────────────────── */

	/* ───────────── Eliminar ───────────────*/

	const handleDelete = async (producto) => {
		const result = await  window.showAlert(
			`¿Deseas eliminar al producto <strong>${producto.Nombre}</strong>?`,
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
				await productoService.eliminarProducto(producto.Id_Productos);

				await window.showAlert("Producto eliminado correctamente",{
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchProductos(categorias);
			} catch (error) {
				console.error("Error Eliminando Producto:", error);
				const mensaje = error.response?.data?.message || "Error al eliminar el producto";

				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};

	/* ───────────────────────────────────── */

	/* ────── Ir Hacia Tallas/Tamaños ────── */

	const handleTallas = () => {
		navigate("/admin/tallas");
	};

	const handleTamanos = () => {
		navigate("/admin/tamanos");
	};

	/* ───────────────────────────────────── */

	return (
		<GeneralTable
			title="Productos"
			columns={columns}
			data={productos}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Productos"
			stateAccessor="Estado"
			goTallas={handleTallas}
			goTamanos={handleTamanos}
		/>
	);
};

export default Productos;
