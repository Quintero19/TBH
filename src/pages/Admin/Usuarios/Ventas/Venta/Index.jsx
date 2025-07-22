import React, { useCallback, useEffect, useState } from "react";
import GeneralTable from "@/components/GeneralTable";
import { ventasService } from "@/service/ventas.service";
import { clienteService } from "@/service/clientes.service";
import { productoService } from "@/service/productos.service";
import { servicioService } from "@/service/serviciosservice";
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
			const mensaje =
				error.response?.data?.message || "Error al obtener las ventas.";
			showAlert(`Error: ${mensaje}`, {
				title: "Error",
				icon: "error",
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
			lista.map((item) => ({
				...item,
				Id_Ventas: `VEN_${item.Id_Ventas}`,
				Total: item.Total ? formatCOP(item.Total) : "-",
			})),
		[],
	);

	/*----------------------------------------------------------------*/

	/*-----------------CAMBIAR EL ESTADO DE LA VENTA------------------*/

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

			if (Array.isArray(detalleCompleto.data?.Detalle_Venta)) {
				for (const det of detalleCompleto.data.Detalle_Venta) {
					try {
						if (det?.Id_Productos) {
							let nombreProducto = `Producto ID: ${det.Id_Productos}`;
							let precioUnitario = parseFloat(
								det.Precio_Unitario || det.Precio || 0,
							);

							try {
								const productoData = await productoService.obtenerProductoPorId(
									det.Id_Productos,
								);
								nombreProducto = productoData?.data?.Nombre || nombreProducto;
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
						(venta.Estado ?? detalleCompleto.data?.Estado)
							? "bg-[#112d25] border-emerald-500/30"
							: "bg-[#2c1a1d] border-rose-500/30"
					}">
					<div class="font-medium ${
						(venta.Estado ?? detalleCompleto.data?.Estado)
							? "text-emerald-300"
							: "text-rose-300"
					}">${(venta.Estado ?? detalleCompleto.data?.Estado) ? "Activo" : "Anulada"}</div>
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
									<th class="py-2 px-3 w-1/5">Nombre</th>
									<th class="py-2 px-3 w-1/5">Cantidad</th>
									<th class="py-2 px-3 w-1/5">Precio Unitario</th>
									<th class="py-2 px-3 w-1/5">Subtotal</th>
								</tr>
								</thead>
								<tbody>
								${productos
									.map(
										(p) => `
									<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
									<td class="py-2 px-3">${safeHtmlValue(p.Nombre)}</td>
									<td class="py-2 px-3">${safeHtmlValue(p.Cantidad)}</td>
									<td class="py-2 px-3">${formatCurrency(p.Precio_Unitario)}</td>
									<td class="py-2 px-3">${formatCurrency(p.Subtotal)}</td>
									</tr>
								`,
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
			// onCancel={handleToggleEstado}
			idAccessor="Id_Ventas"
			stateAccessor="Estado"
		/>
	);
};

export default Ventas;
