import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { productoService } from "@/service/productos.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Productos = () => {
	const [productos, setProductos] = useState([]);
	const canEdit = (productos) => productos.Estado === true;
	const canDelete = (productos) => productos.Estado === true;
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Productos" },
		{ header: "Categoria Producto", accessor: "Categoria" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Precio de Venta / Tamaños", accessor: "Precio_Venta" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ──────── Cargar Productos ───────── */

	const fetchProductos = useCallback(async () => {
		try {
			const response = await productoService.obtenerProductoss();
			setProductos(transformData(response.data));
			console.log(response)
		} catch (error) {
			const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
				showAlert(`Error: ${mensaje || error}`, {
					title: "Error",
					icon: "error",})
			}
	}, []);

	useEffect(() => {
		fetchProductos();
	}, [fetchProductos]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const formatCOP = (value) => {
		if (!value && value !== 0) return "";
		return `$ ${Number(value).toLocaleString("es-CO")}`;
	};


	const transformData = useCallback(
		(lista) =>
			lista.map((item) => {
				let precioVenta;

				if (item.Es_Perfume && item.Detalles?.tamanos?.length > 0) {
					precioVenta = item.Detalles.tamanos
						.map(
							(tamano) =>
								`${tamano.nombre} - ${formatCOP(tamano.precio)}`
						)
						.join("\n");
				} else {
					precioVenta = item.Precio_Venta
						? formatCOP(item.Precio_Venta)
						: "-";
				}

				return {
					...item,
					Precio_Venta: precioVenta,
					Precio_Compra: formatCOP(item.Precio_Compra),
				};
			}),
		[],
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
						<p><strong>Categoria de Producto:</strong> ${producto.Categoria || "-"}</p>
						<p><strong>Nombre:</strong> ${producto.Nombre || "-"}</p>
						<p><strong>Descripción:</strong> ${producto.Descripcion || "-"}</p>
						<p><strong>Precio de Venta:</strong> ${producto.Precio_Venta || "-"}</p>
						<p><strong>Precio de Compra:</strong> ${producto.Precio_Compra || "-"}</p>
						<p><strong>Stock:</strong> ${producto.Stock}</p>
						<p><strong>Estado:</strong> ${producto.Estado ? "Activo" : "Inactivo"}</p>
							</div>`;
			await showAlert(html, {
				title: `Detalles Producto ID: ${producto.Id_Productos}`,
				type: "info",
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			console.error("Error al obtener el producto:", error);
			showAlert(`No se pudieron cargar los detalles del producto: ${error}`, {
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
		const result = await window.showAlert(
			`¿Deseas eliminar al producto <strong>${producto.Nombre}</strong>?`,
			{
				type: "warning",
				title: "¿Estás seguro?",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: "Sí, eliminar",
				cancelButtonText: "Cancelar",
			},
		);

		if (result.isConfirmed) {
			try {
				await productoService.eliminarProducto(producto.Id_Productos);

				await window.showAlert("Producto eliminado correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchProductos();
			} catch (error) {
				console.error("Error Eliminando Producto:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el producto";

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
			canEdit={canEdit}
			canDelete={canDelete}
			goTallas={handleTallas}
			goTamanos={handleTamanos}

		/>
	);
};

export default Productos;
