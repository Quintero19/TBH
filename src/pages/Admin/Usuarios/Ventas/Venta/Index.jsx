import React, { useCallback, useEffect, useState } from "react";
import GeneralTable from "@/components/GeneralTable";
import { ventasService } from "@/service/ventas.service";
import { clienteService } from "@/service/clientes.service";
import { productoService } from "@/service/productos.service";
import { servicioService } from "@/service/serviciosservice";
import { tallasService } from "@/service/tallas.service";
import { tamanosService } from "@/service/tamanos.service";
import { showAlert } from "@/components/AlertProvider";
import { useNavigate } from "react-router-dom";

const Ventas = () => {
	const [ventas, setVentas] = useState([]);
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Ventas" },
		{ header: "Empleado", accessor: "Nombre_Empleado" },
		{ header: "Fecha", accessor: "Fecha" },
		{ header: "Total", accessor: "Total" },
		{ header: "Estado", accessor: "Estado" },
	];

	/*--------------CARGAR LAS VENTAS---------------------------------*/

	const fetchVentas = useCallback(async () => {
		try {
			const response = await ventasService.obtenerVentas();
			setVentas(transformData(response.data));
			// console.log(response);
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

	useEffect(() => {
		fetchVentas();
	}, [fetchVentas]);

	/*----------------------------------------------------------------*/

	/*-----------------FORMATEAR LOS PRECIOS A COP---------------------*/
	const formatCOP = (value) => {
		if (!value && value !== 0) return "";
		return `$ ${Number(value).toLocaleString("es-CO")}`;
	};

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => ({
				...item,
				Id_Ventas: `VEN_${item.Id_Ventas}`,
				Total: item.Total ? formatCOP(item.Total) : "-",
			})),
		[],
	);

	/*----------------------------------------------------------------*/

	/*-----------------CAMBIAR EL ESTADO DE LA VENTA------------------*/
	
	const handleCompletarVenta = async (venta) => {
		try {
			const ventaId = venta.Id_Ventas.replace("VEN_", "");
			await ventasService.marcarVentaCompletada(ventaId);
			await fetchVentas(); // Recargar la lista
			await showAlert("Venta completada exitosamente", {
				type: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error("Error completando venta:", error);
			const mensaje = error.response?.data?.message || "Error al completar la venta";
			await showAlert(mensaje, {
				type: "error",
				title: "Error",
			});
		}
	};

	const handleAnularVenta = async (venta) => {
		try {
			const ventaId = venta.Id_Ventas.replace("VEN_", "");
			await ventasService.anularVenta(ventaId);
			await fetchVentas(); // Recargar la lista
			await showAlert("Venta anulada exitosamente", {
				type: "success",
				duration: 1500,
			});
		} catch (error) {
			console.error("Error anulando venta:", error);
			const mensaje = error.response?.data?.message || "Error al anular la venta";
			await showAlert(mensaje, {
				type: "error",
				title: "Error",
			});
		}
	};

	/*----------------------------------------------------------------*/

	/*---------------------AGREGAR------------------------------------*/

	const handleAdd = () => {
		navigate("/admin/ventas/agregar");
	};

	/*----------------------------------------------------------------*/

	/*---------------------Ver detalles------------------------------------*/

	const handleVerDetalles = async (venta) => {
		try {
			if (!venta?.Id_Ventas) {
				throw new Error("ID de venta no proporcionado");
			}

			const ventaId = venta.Id_Ventas.replace("VEN_", "");
			const detalleCompleto = await ventasService.obtenerVentaPorId(ventaId);

			if (!detalleCompleto?.data) {
				throw new Error("Datos de venta no disponibles");
			}

			let nombreCliente = "Consumidor Final";
			const clienteId = venta.Id_Cliente || detalleCompleto.data?.Id_Cliente;

			if (clienteId) {
				try {
					const clienteData =
						await clienteService.listarClientePorId(clienteId);
					nombreCliente = clienteData?.data?.Nombre || nombreCliente;
				} catch (error) {
					console.error("Error obteniendo cliente:", error);
				}
			}

			const productos = [];
			const servicios = [];

			console.log("Detalle completo de la venta:", detalleCompleto.data);
			
			if (Array.isArray(detalleCompleto.data?.Detalle_Venta)) {
				for (const det of detalleCompleto.data.Detalle_Venta) {
					console.log("Procesando detalle:", det);
					try {
						if (det?.Id_Productos) {
							let nombreProducto = `Producto ID: ${det.Id_Productos}`;
							let precioUnitario = parseFloat(
								det.Precio_Unitario || det.Precio || 0,
							);
							let esRopa = false;
							let esPerfume = false;
							let tallas = [];
							let tamanos = [];

							try {
								const productoData = await productoService.obtenerProductoPorId(
									det.Id_Productos,
								);
								nombreProducto = productoData?.data?.Nombre || nombreProducto;
								
								// Intentar obtener Es_Ropa y Es_Perfume del producto
								esRopa = productoData?.data?.Es_Ropa || false;
								esPerfume = productoData?.data?.Es_Perfume || false;
								
								// Si no están configurados, intentar determinarlo por categoría
								if (!esRopa && !esPerfume) {
									const categoria = productoData?.data?.Categoria || productoData?.data?.Id_Categoria_Producto_Categoria_Producto;
									console.log("Categoría del producto:", categoria);
									
									// Determinar por nombre de categoría o ID
									if (categoria) {
										const nombreCategoria = typeof categoria === 'string' ? categoria : categoria?.Nombre || '';
										const idCategoria = typeof categoria === 'object' ? categoria?.Id_Categoria_Producto : null;
										
										// Lógica para determinar si es ropa o perfume basado en categoría
										if (nombreCategoria.toLowerCase().includes('ropa') || 
											nombreCategoria.toLowerCase().includes('vestimenta') ||
											nombreCategoria.toLowerCase().includes('camisa') ||
											nombreCategoria.toLowerCase().includes('pantalón') ||
											idCategoria === 1) { // Asumiendo que ID 1 es ropa
											esRopa = true;
											console.log("Producto identificado como ropa por categoría:", nombreCategoria);
										} else if (nombreCategoria.toLowerCase().includes('perfume') || 
												   nombreCategoria.toLowerCase().includes('loción') ||
												   nombreCategoria.toLowerCase().includes('cosmético') ||
												   idCategoria === 3) { // Asumiendo que ID 3 es perfumes
											esPerfume = true;
											console.log("Producto identificado como perfume por categoría:", nombreCategoria);
										}
									}
								}
								
								console.log("Producto:", nombreProducto, "Es_Ropa:", esRopa, "Es_Perfume:", esPerfume);
								console.log("Det.Tallas:", det.Tallas);
								console.log("Det.Tamanos:", det.Tamanos);
								
								// Obtener tallas si es ropa
								if (esRopa) {
									// Primero intentar obtener de los campos Tallas
									if (det.Tallas && Array.isArray(det.Tallas) && det.Tallas.length > 0) {
										tallas = det.Tallas;
										console.log("Tallas encontradas en det.Tallas:", tallas);
									} else if (det.tallas && Array.isArray(det.tallas) && det.tallas.length > 0) {
										tallas = det.tallas;
										console.log("Tallas encontradas en det.tallas:", tallas);
									} else if (det.Id_Producto_Tallas) {
										// Si solo tenemos un ID de talla, obtener los datos completos
										try {
											const tallaData = await tallasService.obtenerTallaPorId(det.Id_Producto_Tallas);
											if (tallaData?.data) {
												tallas = [{ 
													nombre: tallaData.data.Nombre || "Talla",
													Cantidad: det.Cantidad 
												}];
												console.log("Talla encontrada:", tallaData.data);
											} else {
												tallas = [{ nombre: "Talla seleccionada", Cantidad: det.Cantidad }];
												console.log("Talla encontrada por ID:", det.Id_Producto_Tallas);
											}
										} catch (error) {
											console.error("Error obteniendo talla:", error);
											tallas = [{ nombre: "Talla seleccionada", Cantidad: det.Cantidad }];
										}
									}
								}
								
								// Obtener tamaños si es perfume
								if (esPerfume) {
									// Primero intentar obtener de los campos Tamanos
									if (det.Tamanos && Array.isArray(det.Tamanos) && det.Tamanos.length > 0) {
										tamanos = det.Tamanos;
										console.log("Tamaños encontrados en det.Tamanos:", tamanos);
									} else if (det.tamanos && Array.isArray(det.tamanos) && det.tamanos.length > 0) {
										tamanos = det.tamanos;
										console.log("Tamaños encontrados en det.tamanos:", tamanos);
									} else if (det.Id_Producto_Tamano_Insumos) {
										// Si solo tenemos un ID de tamaño, obtener los datos completos
										try {
											// Usar los datos que ya vienen en la respuesta
											if (det.Id_Producto_Tamano_Insumos_Producto_Tamano_Insumo) {
												const tamanoId = det.Id_Producto_Tamano_Insumos_Producto_Tamano_Insumo.Id_Producto_Tamano;
												
												// Intentar obtener el nombre del tamaño desde el servicio
												try {
													const tamanoData = await tamanosService.obtenerTamanoPorId(tamanoId);
													if (tamanoData?.data) {
														// Si la cantidad es mayor a 1, podría ser que se llevaron varios tamaños
														// pero el backend solo guardó uno. Mostrar información adicional
														const nombreTamaño = tamanoData.data.Nombre || `Tamaño ${tamanoId}`;
														tamanos = [{ 
															nombre: nombreTamaño,
															Cantidad: det.Cantidad 
														}];
														
																											// Si la cantidad es alta, intentar obtener todos los tamaños del producto
													if (det.Cantidad > 1) {
														console.log(`Nota: Se llevaron ${det.Cantidad} unidades del tamaño ${nombreTamaño}. Es posible que se hayan seleccionado múltiples tamaños pero el backend solo guardó uno.`);
														
														// Intentar obtener todos los tamaños del producto para mostrar información adicional
														try {
															const productoDetallado = await productoService.obtenerProductoPorId(det.Id_Productos);
															if (productoDetallado?.data?.Detalles?.tamanos) {
																console.log("Tamaños disponibles del producto:", productoDetallado.data.Detalles.tamanos);
																// Agregar información de tamaños disponibles
																const tamanosDisponibles = productoDetallado.data.Detalles.tamanos.map(t => t.nombre).join(", ");
																console.log(`Tamaños disponibles: ${tamanosDisponibles}`);
															}
														} catch (error) {
															console.error("Error obteniendo tamaños del producto:", error);
														}
													}
														
														console.log("Tamaño encontrado con nombre:", tamanoData.data);
													} else {
														tamanos = [{ 
															nombre: `Tamaño ID: ${tamanoId}`,
															Cantidad: det.Cantidad 
														}];
													}
												} catch (tamanoError) {
													console.error("Error obteniendo datos del tamaño:", tamanoError);
													tamanos = [{ 
														nombre: `Tamaño ID: ${tamanoId}`,
														Cantidad: det.Cantidad 
													}];
												}
											} else {
												tamanos = [{ nombre: "Tamaño seleccionado", Cantidad: det.Cantidad }];
												console.log("Tamaño encontrado por ID:", det.Id_Producto_Tamano_Insumos);
											}
										} catch (error) {
											console.error("Error obteniendo tamaño:", error);
											tamanos = [{ nombre: "Tamaño seleccionado", Cantidad: det.Cantidad }];
										}
									}
								}
							} catch (error) {
								console.error(
									`Error obteniendo producto ${det.Id_Productos}:`,
									error,
								);
							}

							productos.push({
								Nombre: nombreProducto,
								Cantidad: parseInt(det.Cantidad || 1, 10),
								Precio_Unitario: precioUnitario,
								Subtotal: parseFloat(
									det.Subtotal ||
										precioUnitario * parseInt(det.Cantidad || 1, 10),
								),
								Es_Ropa: esRopa,
								Es_Perfume: esPerfume,
								Tallas: tallas,
								Tamanos: tamanos,
							});
						} else if (det?.Id_Servicios) {
							let nombreServicio = `Servicio ID: ${det.Id_Servicios}`;
							let precioServicio = parseFloat(
								det.Precio_Unitario || det.Precio || 0,
							);

							try {
								const servicioData = await servicioService.obtenerServicioPorId(
									det.Id_Servicios,
								);
								nombreServicio = servicioData?.data?.Nombre || nombreServicio;
							} catch (error) {
								console.error(
									`Error obteniendo servicio ${det.Id_Servicios}:`,
									error,
								);
							}

							servicios.push({
								Nombre: nombreServicio,
								Precio: precioServicio,
								Subtotal: parseFloat(det.Subtotal || precioServicio),
							});
						}
					} catch (error) {
						console.error("Error procesando detalle:", error);
					}
				}
			}

			const totalVenta = parseFloat(
				detalleCompleto.data?.Total ||
					venta.Total ||
					productos.reduce((sum, p) => sum + p.Subtotal, 0) +
						servicios.reduce((sum, s) => sum + s.Subtotal, 0),
			);

			const safeHtmlValue = (value) => value ?? "N/A";

			const formatCurrency = (value) => {
				const num = parseFloat(value) || 0;
				return `$${num.toLocaleString("es-ES")}`.replace(/,00$/, "");
			};

			const html = `
			<div class="space-y-7 text-gray-100">
				<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
				<h3 class="text-xl font-bold text-white">Detalles de la Venta</h3>
				<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
					ID: ${safeHtmlValue(venta.Id_Ventas)}
				</span>
				</div>

				<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Fecha</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
					<div class="font-medium text-white">${safeHtmlValue(venta.Fecha || detalleCompleto.data?.Fecha)}</div>
					</div>
				</div>

				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Estado</label>
					<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
						(venta.Estado ?? detalleCompleto.data?.Estado) === 3
							? "bg-[#1a1d2c] border-yellow-500/30"
							: (venta.Estado ?? detalleCompleto.data?.Estado) === 1
							? "bg-[#112d25] border-emerald-500/30"
							: (venta.Estado ?? detalleCompleto.data?.Estado) === 2
							? "bg-[#2c1a1d] border-rose-500/30"
							: (venta.Estado ?? detalleCompleto.data?.Estado)
							? "bg-[#112d25] border-emerald-500/30"
							: "bg-[#2c1a1d] border-rose-500/30"
					}">
					<div class="font-medium ${
						(venta.Estado ?? detalleCompleto.data?.Estado) === 3
							? "text-yellow-300"
							: (venta.Estado ?? detalleCompleto.data?.Estado) === 1
							? "text-emerald-300"
							: (venta.Estado ?? detalleCompleto.data?.Estado) === 2
							? "text-rose-300"
							: (venta.Estado ?? detalleCompleto.data?.Estado)
							? "text-emerald-300"
							: "text-rose-300"
					}">${
						(venta.Estado ?? detalleCompleto.data?.Estado) === 3
							? "Pendiente"
							: (venta.Estado ?? detalleCompleto.data?.Estado) === 1
							? "Completada"
							: (venta.Estado ?? detalleCompleto.data?.Estado) === 2
							? "Anulada"
							: (venta.Estado ?? detalleCompleto.data?.Estado)
							? "Completada"
							: "Anulada"
					}</div>
					</div>
				</div>

				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Cliente</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
					<div class="font-medium text-white">${safeHtmlValue(nombreCliente)}</div>
					</div>
				</div>

				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Total</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
					<div class="font-medium text-white">${formatCurrency(totalVenta)}</div>
					</div>
				</div>

				<div class="relative md:col-span-2">
					<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">Productos Vendidos</label>
					<div class="rounded-lg border border-gray-600/50 px-4 bg-[#111827] pt-4">
					<div class="max-h-60 overflow-y-auto">
						${
							productos.length > 0
								? `<table class="w-full table-fixed text-left text-sm text-gray-200">
								<thead class="bg-[#111827] text-gray-300 uppercase tracking-wide shadow">
								<tr>
									<th class="py-2 px-3 w-1/6">Nombre</th>
									<th class="py-2 px-3 w-1/6">Cantidad</th>
									<th class="py-2 px-3 w-1/6">Precio Unitario</th>
									<th class="py-2 px-3 w-1/6">Subtotal</th>
									<th class="py-2 px-3 w-1/6">Tallas/Tamaños</th>
								</tr>
								</thead>
								<tbody>
								${productos
									.map(
										(p) => {
											let tallasTamanosHtml = "";
											
											// Mostrar tallas si es ropa
											if (p.Es_Ropa && p.Tallas && p.Tallas.length > 0) {
												tallasTamanosHtml = p.Tallas.map(talla => 
													`<span class="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mr-1 mb-1">${talla.nombre}: ${talla.Cantidad} uds</span>`
												).join("");
											}
											
											// Mostrar tamaños si es perfume
											if (p.Es_Perfume && p.Tamanos && p.Tamanos.length > 0) {
												tallasTamanosHtml = p.Tamanos.map(tamano => 
													`<span class="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded mr-1 mb-1">${tamano.nombre}: ${tamano.Cantidad} uds</span>`
												).join("");
												
												// Si solo hay un tamaño pero la cantidad es alta, agregar una nota
												if (p.Tamanos.length === 1 && p.Tamanos[0].Cantidad > 1) {
													tallasTamanosHtml += `<br><span class="text-orange-400 text-xs italic">Nota: Es posible que se hayan seleccionado múltiples tamaños</span>`;
												}
											}
											
											return `
									<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
									<td class="py-2 px-3">${safeHtmlValue(p.Nombre)}</td>
									<td class="py-2 px-3">${safeHtmlValue(p.Cantidad)}</td>
									<td class="py-2 px-3">${formatCurrency(p.Precio_Unitario)}</td>
									<td class="py-2 px-3">${formatCurrency(p.Subtotal)}</td>
									<td class="py-2 px-3">
										${tallasTamanosHtml || 
											(p.Es_Ropa ? '<span class="text-orange-400 text-xs">Ropa sin tallas registradas</span>' : 
											 p.Es_Perfume ? '<span class="text-orange-400 text-xs">Perfume sin tamaños registrados</span>' : 
											 '<span class="text-gray-400 text-xs">Sin tallas/tamaños</span>')}
									</td>
									</tr>
								`;
										}
									)
									.join("")}
								</tbody>
							</table>`
								: `<p class="italic text-gray-400 text-base">No hay productos en esta venta</p>`
						}
					</div>
					</div>
				</div>

				<div class="relative md:col-span-2">
					<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">Servicios Asociados</label>
					<div class="rounded-lg border border-gray-600/50 px-4 bg-[#111827] pt-4">
					<div class="max-h-60 overflow-y-auto">
						${
							servicios.length > 0
								? `<table class="w-full table-fixed text-left text-sm text-gray-200">
								<thead class="bg-[#111827] text-gray-300 uppercase tracking-wide shadow">
								<tr>
									<th class="py-2 px-3 w-1/3">Nombre</th>
									<th class="py-2 px-3 w-1/3">Precio</th>
									<th class="py-2 px-3 w-1/3">Subtotal</th>
								</tr>
								</thead>
								<tbody>
								${servicios
									.map(
										(s) => `
									<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
									<td class="py-2 px-3">${safeHtmlValue(s.Nombre)}</td>
									<td class="py-2 px-3">${formatCurrency(s.Precio)}</td>
									<td class="py-2 px-3">${formatCurrency(s.Subtotal)}</td>
									</tr>
								`,
									)
									.join("")}
								</tbody>
							</table>`
								: `<p class="italic text-gray-400 text-base">No hay servicios en esta venta</p>`
						}
					</div>
					</div>
				</div>
				</div>
			</div>
			`;

			await showAlert(html, {
				type: "info",
				showConfirmButton: true,
				width: "60rem",
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			console.error("Error:", error);
			await showAlert(`No se pudieron cargar los detalles: ${error.message}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/*----------------------------------------------------------------*/

	return (
		<GeneralTable
			title="Ventas"
			columns={columns}
			data={ventas}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onCompletar={handleCompletarVenta}
			onAnular={handleAnularVenta}
			onEdit={() => {}} // No se usa para ventas
			onDelete={() => {}} // No se usa para ventas
			onToggleEstado={() => {}} // No se usa para ventas
			idAccessor="Id_Ventas"
			stateAccessor="Estado"
		/>
	);
};

export default Ventas;
