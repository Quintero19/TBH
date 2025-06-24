import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import CarruselImagenes from "@/components/CarruselImagenes";
import { productoService } from "@/service/productos.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Productos = () => {
	const [productos, setProductos] = useState([]);
	const [mostrarCarrusel, setMostrarCarrusel] = useState(false);
	const [imagenesActuales, setImagenesActuales] = useState([]);
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

	const verImagenes = (producto) => {
		if (!producto?.Imagenes?.length) return;

		const urls = producto.Imagenes.map((img) => img.URL); // ← aquí extraes solo las URLs
		setImagenesActuales(urls);
		setMostrarCarrusel(true);
	};


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
				<div class="space-y-6 text-gray-100">
					<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-4">
						<h3 class="text-xl font-bold text-white">Detalles del Producto</h3>
						<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
							ID: ${producto.Id_Productos ?? "N/A"}
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="relative col-span-2">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Nombre</label>
							<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
								${producto.Nombre}
							</div>
						</div>

						<div class="relative ${!producto.Es_Perfume ? 'md:col-span-2' : ''}">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">
								Categoría
							</label>
							<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
								${producto.Categoria}
							</div>
						</div>

						<div class="relative">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Estado</label>
							<div class="rounded-lg px-4 pt-4 pb-2.5 font-medium border ${producto.Estado ? "bg-[#112d25] border-emerald-500/30 text-emerald-300" : "bg-[#2c1a1d] border-rose-500/30 text-rose-300"}">
								${producto.Estado ? "Activo" : "Inactivo"}
							</div>
						</div>

						${!producto.Es_Perfume ?`
							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Precio Venta</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${producto.Precio_Venta}
								</div>
							</div>
							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Precio Compra</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${producto.Precio_Compra || "-"}
								</div>
							</div>

							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Stock General</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${producto.Stock}
								</div>
							</div>
						` : ''}
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Descripción</label>
						<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
							${producto.Descripcion}
						</div>
					</div>

					${producto.Es_Perfume && producto.Detalles?.tamanos?.length ? `
						<div class="relative md:col-span-2">
							<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">Tamaños Asociaods</label>
							<div class="rounded-lg border border-gray-600/50 pb-3 px-4 bg-[#111827] max-h-48 overflow-y-auto">
								<table class="w-full text-left text-base text-gray-200">
									<thead class="sticky top-0 z-20 bg-[#111827] text-gray-300 text-sm uppercase tracking-wide shadow">
										<tr>
											<th class="py-2">Tamaño</th>
											<th class="py-2">Precio</th>
										</tr>
									</thead>
									<tbody>
										${producto.Detalles.tamanos.map(t => `
											<tr class="border-b border-gray-800">
												<td class="py-2">${t.nombre}</td>
												<td class="py-2">$${Number(t.precio).toLocaleString()}</td>
											</tr>
										`).join("")}
									</tbody>
								</table>
							</div>
						</div>
					` : ''}

					${producto.Es_Ropa && producto.Detalles?.tallas?.length ? `
						<div class="relative relative md:col-span-2">
							<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">Tallas del Producto</label>
							<div class="rounded-lg border border-gray-600/50 pb-3 px-4 bg-[#111827] max-h-48 overflow-y-auto">
								<table class="w-full text-left text-base text-gray-200">
									<thead class="sticky top-0 z-20 bg-[#111827] text-gray-300 text-sm uppercase tracking-wide shadow">
										<tr>
											<th class="py-3 px-5">Talla</th>
											<th class="py-3 px-5">Stock</th>
										</tr>
									</thead>
									<tbody>
										${producto.Detalles.tallas.map(t => `
											<tr class="border-b border-gray-800">
												<td class="py-3 px-8">${t.nombre}</td>
												<td class="py-3 px-8">${t.stock}</td>
											</tr>
										`).join("")}
									</tbody>
								</table>
							</div>
						</div>
					` : ''}
				</div>
			`;
			await showAlert(html, {
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
		<>
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
				verImagenes={verImagenes}
			/>

			<CarruselImagenes
				imagenes={imagenesActuales}
				visible={mostrarCarrusel}
				onClose={() => setMostrarCarrusel(false)}
			/>
		</>
	);
};

export default Productos;
