import React, { useCallback, useEffect, useState } from "react";
import GeneralTable from "@/components/GeneralTable";
import { ventasService } from "@/service/ventas.service";
import { clienteService } from "@/service/clientes.service";
import { productoService } from "@/service/productos.service";
import { servicioService } from "@/service/serviciosservice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
		} catch (error) {
			const mensaje = error.response?.data?.message || "Error al obtener las ventas.";
			showAlert(`Error: ${mensaje}`, {
				duration: 2500,
				title: "Error",
				icon: "error",
				didClose: () => {navigate(-1)},
			});
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
			lista.map((item) => {
				// Procesar datos de venta usando el servicio mejorado
				const ventaProcesada = ventasService.procesarDatosVenta(item);
				
				return {
					...ventaProcesada,
					Id_Ventas: `VEN_${item.Id_Ventas}`,
					Total: item.Total ? formatCOP(item.Total) : "-",
					Estado: ventasService.obtenerDescripcionEstado(item.Estado),
					M_Pago: ventasService.obtenerDescripcionMetodoPago(item.M_Pago),
				};
			}),
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
			
			// Procesar los datos de la venta usando el servicio
			const ventaProcesada = ventasService.procesarDatosVenta(detalleCompleto.data);
			
			if (Array.isArray(ventaProcesada?.Detalle_Venta)) {
				for (const det of ventaProcesada.Detalle_Venta) {
					try {
						if (det?.Id_Productos) {
							let nombreProducto = `Producto ID: ${det.Id_Productos}`;
							let precioUnitario = parseFloat(
								det.Precio_Unitario || det.Precio || 0,
							);
							let tallas = [];
							let tamanos = [];

							try {
								const productoData = await productoService.obtenerProductoPorId(
									det.Id_Productos,
								);
								nombreProducto = productoData?.data?.Nombre || nombreProducto;
								
								// Obtener tallas y tamaños de los datos procesados
								if (det.Tallas && Array.isArray(det.Tallas) && det.Tallas.length > 0) {
									tallas = det.Tallas;
								}
								
								if (det.Tamanos && Array.isArray(det.Tamanos) && det.Tamanos.length > 0) {
									tamanos = det.Tamanos;
								}
							} catch (error) {
								console.error(
									`Error obteniendo producto ${det.Id_Productos}:`,
									error,
								);
							}

							const cantidad = parseInt(det.Cantidad || 1, 10);
							const subtotal = parseFloat(
								det.Subtotal ||
									precioUnitario * cantidad,
							);
							
							const productoFinal = {
								Nombre: nombreProducto,
								Cantidad: cantidad,
								Precio_Unitario: precioUnitario,
								Subtotal: subtotal,
								Tallas: tallas,
								Tamanos: tamanos,
							};
							
							productos.push(productoFinal);
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

							const subtotalServicio = parseFloat(det.Subtotal || precioServicio);
							servicios.push({
								Nombre: nombreServicio,
								Precio: precioServicio,
								Subtotal: subtotalServicio,
							});
						}
					} catch (error) {
						console.error("Error procesando detalle:", error);
					}
				}
			}

			// Calcular el total correctamente sumando todos los subtotales
			const totalProductos = productos.reduce((sum, p) => sum + p.Subtotal, 0);
			const totalServicios = servicios.reduce((sum, s) => sum + s.Subtotal, 0);
			const totalVenta = totalProductos + totalServicios;

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
											
											// Mostrar tallas si existen
											if (p.Tallas && Array.isArray(p.Tallas) && p.Tallas.length > 0) {
												tallasTamanosHtml = p.Tallas.map(talla => 
													`<span class="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded mr-1 mb-1">${talla.talla || talla.nombre || 'Talla'}: ${talla.cantidad || talla.Cantidad || 1} uds</span>`
												).join("");
											}
											
											// Mostrar tamaños si existen
											if (p.Tamanos && Array.isArray(p.Tamanos) && p.Tamanos.length > 0) {
												tallasTamanosHtml = p.Tamanos.map(tamano => 
													`<span class="inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded mr-1 mb-1">${tamano.nombre || 'Tamaño'}: ${tamano.Cantidad || tamano.cantidad || 1} uds</span>`
												).join("");
											}
											
											return `
									<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
									<td class="py-2 px-3">${safeHtmlValue(p.Nombre)}</td>
									<td class="py-2 px-3">${safeHtmlValue(p.Cantidad)}</td>
									<td class="py-2 px-3">${formatCurrency(p.Precio_Unitario)}</td>
									<td class="py-2 px-3">${formatCurrency(p.Subtotal)}</td>
									<td class="py-2 px-3">
										${tallasTamanosHtml || '<span class="text-gray-400 text-xs">Sin tallas/tamaños</span>'}
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
				showConfirmButton: false,
				showDenyButton: false,
				width: "60rem",
				swalOptions: {
					padding: "1rem",
					showCloseButton: true,
					closeButtonHtml: '<button style="position: absolute; top: 10px; right: 10px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>',
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

	/*---------------------Generar Factura PDF------------------------------------*/
	const generarFacturaPDF = async (venta) => {
		try {
			// Obtener datos completos de la venta
			const ventaId = venta.Id_Ventas.replace("VEN_", "");
			const ventaCompleta = await ventasService.obtenerVentaPorId(ventaId);
			
			if (!ventaCompleta?.data) {
				throw new Error("No se pudieron obtener los datos de la venta");
			}

			const datosVenta = ventasService.procesarDatosVenta(ventaCompleta.data);

			// Crear el contenido HTML para la factura
			const contenidoHTML = generarHTMLFactura(datosVenta);

			// Crear un elemento temporal para renderizar el HTML
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = contenidoHTML;
			tempDiv.style.position = 'absolute';
			tempDiv.style.left = '-9999px';
			tempDiv.style.top = '0';
			tempDiv.style.width = '800px';
			tempDiv.style.backgroundColor = 'white';
			tempDiv.style.padding = '20px';
			document.body.appendChild(tempDiv);

			try {
				// Convertir HTML a canvas
				const canvas = await html2canvas(tempDiv, {
					scale: 2,
					useCORS: true,
					allowTaint: true,
					backgroundColor: '#ffffff',
					width: 800,
					height: tempDiv.scrollHeight
				});

				// Crear PDF
				const pdf = new jsPDF('p', 'mm', 'a4');
				const imgWidth = 210; // A4 width in mm
				const pageHeight = 295; // A4 height in mm
				const imgHeight = (canvas.height * imgWidth) / canvas.width;
				let heightLeft = imgHeight;

				let position = 0;

				// Agregar primera página
				pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;

				// Agregar páginas adicionales si es necesario
				while (heightLeft >= 0) {
					position = heightLeft - imgHeight;
					pdf.addPage();
					pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
					heightLeft -= pageHeight;
				}

				// Descargar el PDF
				const fileName = `Factura_${datosVenta.Id_Ventas}_${new Date().toISOString().split('T')[0]}.pdf`;
				pdf.save(fileName);

				await showAlert("Factura PDF generada y descargada exitosamente", {
					type: "success",
					title: "Éxito",
					timer: 3000,
				});

			} finally {
				// Limpiar el elemento temporal
				document.body.removeChild(tempDiv);
			}

		} catch {
			await showAlert("Error al generar la factura PDF", {
				type: "error",
				title: "Error",
			});
		}
	};

	const generarHTMLFactura = (datosVenta) => {
		const productos = datosVenta.Detalle_Venta?.filter(item => item.Id_Productos) || [];
		const servicios = datosVenta.Detalle_Venta?.filter(item => item.Id_Servicios) || [];

		const formatCOP = (value) => {
			if (!value && value !== 0) return "$0";
			return `$${Number(value).toLocaleString("es-CO")}`;
		};

		const formatFecha = (fecha) => {
			return new Date(fecha).toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		};

		return `
			<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 20px;">
				<!-- Header -->
				<div style="text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
					<div style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px;">TBH - Tienda de Belleza y Hogar</div>
					<div style="font-size: 24px; font-weight: bold; color: #666;">FACTURA</div>
				</div>

				<!-- Información de la venta -->
				<div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
					<div style="flex: 1; margin-right: 20px;">
						<h3 style="color: #333; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Información de la Venta</h3>
						<p style="margin: 8px 0;"><strong>Factura #:</strong> ${datosVenta.Id_Ventas}</p>
						<p style="margin: 8px 0;"><strong>Fecha:</strong> ${formatFecha(datosVenta.Fecha)}</p>
						<p style="margin: 8px 0;"><strong>Estado:</strong> ${ventasService.obtenerDescripcionEstado(datosVenta.Estado)}</p>
						<p style="margin: 8px 0;"><strong>Método de Pago:</strong> ${ventasService.obtenerDescripcionMetodoPago(datosVenta.M_Pago)}</p>
						${datosVenta.Referencia ? `<p style="margin: 8px 0;"><strong>Referencia:</strong> ${datosVenta.Referencia}</p>` : ''}
					</div>
					<div style="flex: 1;">
						<h3 style="color: #333; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Empleado</h3>
						<p style="margin: 8px 0;"><strong>Nombre:</strong> ${datosVenta.Nombre_Empleado || 'No especificado'}</p>
						<p style="margin: 8px 0;"><strong>ID:</strong> ${datosVenta.Id_Empleados}</p>
					</div>
				</div>

				<!-- Productos -->
				${productos.length > 0 ? `
				<div style="margin-bottom: 30px;">
					<h3 style="color: #333; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Productos</h3>
					<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
						<thead>
							<tr style="background-color: #f8f9fa;">
								<th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Producto</th>
								<th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Cantidad</th>
								<th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">Precio Unitario</th>
								<th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">Subtotal</th>
							</tr>
						</thead>
						<tbody>
							${productos.map(item => `
								<tr>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: left;">
										<div style="font-weight: bold;">${item.Id_Productos_Producto?.Nombre || 'Producto'}</div>
										${item.Tallas && Array.isArray(item.Tallas) && item.Tallas.length > 0 ? `
											<div style="font-size: 11px; color: #666; margin-top: 5px;">
												Tallas: ${item.Tallas.map(t => `${t.talla || t.nombre || 'Talla'}(${t.cantidad || t.Cantidad || 1})`).join(', ')}
											</div>
										` : ''}
										${item.Tamanos && Array.isArray(item.Tamanos) && item.Tamanos.length > 0 ? `
											<div style="font-size: 11px; color: #666; margin-top: 5px;">
												Tamaños: ${item.Tamanos.map(t => `${t.nombre || 'Tamaño'}(${t.Cantidad || t.cantidad || 1})`).join(', ')}
											</div>
										` : ''}
									</td>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.Cantidad}</td>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${formatCOP(item.Precio)}</td>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">${formatCOP(item.Subtotal)}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>
				</div>
				` : ''}

				<!-- Servicios -->
				${servicios.length > 0 ? `
				<div style="margin-bottom: 30px;">
					<h3 style="color: #333; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">Servicios</h3>
					<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
						<thead>
							<tr style="background-color: #f8f9fa;">
								<th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Servicio</th>
								<th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Cantidad</th>
								<th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">Precio Unitario</th>
								<th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">Subtotal</th>
							</tr>
						</thead>
						<tbody>
							${servicios.map(item => `
								<tr>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">${item.Id_Servicios_Servicio?.Nombre || 'Servicio'}</td>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.Cantidad}</td>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${formatCOP(item.Precio)}</td>
									<td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">${formatCOP(item.Subtotal)}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>
				</div>
				` : ''}

				<!-- Total -->
				<div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333;">
					<div style="font-size: 20px; font-weight: bold; color: #333;">
						<strong>TOTAL: ${formatCOP(datosVenta.Total)}</strong>
					</div>
				</div>

				<!-- Footer -->
				<div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
					<p style="margin: 5px 0; font-size: 14px; font-weight: bold;">Gracias por su compra</p>
					<p style="margin: 5px 0;">TBH - Tienda de Belleza y Hogar</p>
					<p style="margin: 5px 0;">Factura generada el ${formatFecha(new Date())}</p>
				</div>
			</div>
		`;
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
				onGenerarFactura={generarFacturaPDF}
				onEdit={() => {}} // No se usa para ventas
				onDelete={() => {}} // No se usa para ventas
				onToggleEstado={() => {}} // No se usa para ventas
				idAccessor="Id_Ventas"
				stateAccessor="Estado"
			/>
	);
};

export default Ventas;
