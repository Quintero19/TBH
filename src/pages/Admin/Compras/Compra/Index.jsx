import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { comprasService } from "@/service/compras.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Compras = () => {
	const [compras, setCompras] = useState([]);
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Compras" },
		{ header: "Proveedor", accessor: "Proveedor" },
		{ header: "Fecha", accessor: "Fecha" },
		{ header: "Total", accessor: "Total" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ────────── Cargar Compras ────────── */

	const fetchCompras = useCallback(async (proveedoresData) => {
		try {
			const response = await comprasService.obtenerCompras();
			setCompras(transformData(response.data, proveedoresData));
			console.log(response)
		}catch (error) {
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
		fetchCompras();
	}, [fetchCompras]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const formatCOP = (value) => {
		if (!value && value !== 0) return "";
		return `$ ${Number(value).toLocaleString("es-CO")}`;
	};

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => ({
				...item,
				Id_Compras: `COM_${item.Id_Compras}`,
				Total: item.Total ? formatCOP(item.Total) : "-",
			})),
		[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		const result = await window.showAlert("¿Deseas anular esta Compra?", {
			type: "warning",
			title: "¿Estás seguro?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, Anular",
			cancelButtonText: "Cancelar",
		});
		if (result.isConfirmed) {
			try {
				await comprasService.cambiarEstadoCompra(id);
				await fetchCompras();
			} catch (error) {
				console.error("Error Anulando Compra:", error);
				const mensaje =
					error.response?.data?.message || "Error al anular la compra";

				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/compras/agregar");
	};

	/* ──────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (compra) => {
		try {
			const html = `
			<div class="space-y-7 text-gray-100">

			<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
				<h3 class="text-xl font-bold text-white">Detalles de la Compra</h3>
				<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
				ID: ${compra.Id_Compras ?? "N/A"}
				</span>
			</div>

			<div class="grid grid-cols-1 gap-7 md:grid-cols-2">

				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Fecha</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${compra.Fecha}</div>
					</div>
				</div>

				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Estado</label>
					<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
						compra.Estado
							? "bg-[#112d25] border-emerald-500/30"
							: "bg-[#2c1a1d] border-rose-500/30"
					}">
						<div class="font-medium ${
							compra.Estado ? "text-emerald-300" : "text-rose-300"
						}">${compra.Estado ? "Activo" : "Inactivo"}</div>
					</div>
				</div>

				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Proveedor</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${compra.Proveedor ?? "-"}</div>
					</div>
				</div>

				<div class="relative">
				<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Total</label>
				<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
					<div class="font-medium text-white">${compra.Total}</div>
				</div>
				</div>

				<div class="relative md:col-span-2">
				<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">Insumos Relacionados</label>
				<div class="rounded-lg border border-gray-600/50 px-4 bg-[#111827] pt-4">
					<div class="max-h-60 overflow-y-auto">
					${
						compra.Insumos.length > 0
							? `
						<table class="w-full table-fixed text-left text-sm text-gray-200">
							<thead class="sticky top-0 z-20 bg-[#111827] text-gray-300 uppercase tracking-wide shadow">
							<tr>
								<th class="py-3 px-4 w-1/6 whitespace-nowrap">ID</th>
								<th class="py-3 px-4 w-2/6 whitespace-nowrap">Nombre</th>
								<th class="py-3 px-4 w-1/6 whitespace-nowrap">Cantidad</th>
								<th class="py-3 px-4 w-1/6 whitespace-nowrap">Precio Unidad</th>
								<th class="py-3 px-4 w-1/6 whitespace-nowrap">Subtotal</th>
							</tr>
							</thead>
							<tbody>
							${compra.Insumos.map(
								(i) => `
								<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
								<td class="py-3 px-4">${i.Id_Insumos}</td>
								<td class="py-3 px-4">${i.Nombre}</td>
								<td class="py-3 px-4">${i.Cantidad}</td>
								<td class="py-3 px-4">$${parseFloat(i.Precio_ml).toLocaleString()}</td>
								<td class="py-3 px-4">$${parseFloat(i.Subtotal).toLocaleString()}</td>
								</tr>
							`,
							).join("")}
							</tbody>
						</table>`
							: `<p class="italic text-gray-400 text-base">No hay insumos asociados</p>`
					}
					</div>
				</div>
				</div>

				<div class="relative md:col-span-2">
				<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">Productos Relacionados</label>
				<div class="rounded-lg border border-gray-600/50 px-4 bg-[#111827] pt-4">
					<div class="max-h-60 overflow-y-auto">
					${
						compra.Productos.length > 0
							? `
						<table class="w-full table-fixed text-left text-sm text-gray-200">
							<thead class="bg-[#111827] text-gray-300 uppercase tracking-wide shadow">
							<tr>
								<th class="py-2 px-3 w-1/5 whitespace-nowrap">Nombre</th>
								<th class="py-2 px-3 w-1/5 whitespace-nowrap">Cantidad</th>
								<th class="py-2 px-3 w-1/5 whitespace-nowrap">Tallas</th>
								<th class="py-2 px-3 w-1/5 whitespace-nowrap">Precio Unitario</th>
								<th class="py-2 px-3 w-1/5 whitespace-nowrap">Subtotal</th>

							</tr>
							</thead>
							<tbody>
							${compra.Productos.map(
								(p) => `
								<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
								<td class="py-2 px-3 font-semibold text-white">${p.Nombre}</td>
								<td class="py-2 px-3">${p.Cantidad}</td>
								<td class="py-2 px-3">
									${
										p.Tallas && p.Tallas.length > 0
											? p.Tallas.map((t) => `${t.Talla}: ${t.Cantidad}`).join(
													"<br>",
												)
											: "-"
									}
								</td>
								<td class="py-2 px-3">$${parseFloat(p.Precio_Unitario).toLocaleString()}</td>
								<td class="py-2 px-3">$${parseFloat(p.Subtotal).toLocaleString()}</td>

								</tr>
							`,
							).join("")}
							</tbody>
						</table>`
							: `<p class="italic text-gray-400 text-base">No hay productos asociados</p>`
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
			console.error("Error al obtener la talla:", error);
			showAlert(`No se pudieron cargar los detalles de la talla:${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ─────── Generar Factura PDF ──────── */
	const generarFacturaPDF = async (compra) => {
		try {
			// 1. Obtener ID limpio (quitamos prefijo COM_)
			const compraId = compra.Id_Compras.replace("COM_", "");
			const compraCompleta = await comprasService.obtenerCompraPorId(compraId);

			if (!compraCompleta?.data) {
				throw new Error("No se pudieron obtener los datos de la compra");
			}

			const datosCompra = compraCompleta.data;

			// 2. Crear el HTML de la factura
			const contenidoHTML = generarHTMLFacturaCompra(datosCompra);

			// 3. Crear un elemento temporal
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = contenidoHTML;
			tempDiv.style.position = "absolute";
			tempDiv.style.left = "-9999px";
			tempDiv.style.top = "0";
			tempDiv.style.width = "800px";
			tempDiv.style.backgroundColor = "white";
			tempDiv.style.padding = "20px";
			document.body.appendChild(tempDiv);

			try {
				// 4. Convertir HTML a canvas
				const canvas = await html2canvas(tempDiv, {
					scale: 2,
					useCORS: true,
					allowTaint: true,
					backgroundColor: "#ffffff",
					width: 800,
					height: tempDiv.scrollHeight,
				});

				// 5. Crear PDF
				const pdf = new jsPDF("p", "mm", "a4");
				const imgWidth = 210;
				const pageHeight = 295;
				const imgHeight = (canvas.height * imgWidth) / canvas.width;
				let heightLeft = imgHeight;
				let position = 0;

				pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;

				while (heightLeft >= 0) {
					position = heightLeft - imgHeight;
					pdf.addPage();
					pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
					heightLeft -= pageHeight;
				}

				// 6. Descargar
				const fileName = `Compra_${datosCompra.Id_Compras}_${new Date()
					.toISOString()
					.split("T")[0]}.pdf`;
				pdf.save(fileName);

				await showAlert("Factura PDF generada y descargada exitosamente", {
					type: "success",
					title: "Éxito",
					timer: 3000,
				});
			} finally {
				// 7. Limpiar
				document.body.removeChild(tempDiv);
			}
		} catch (error) {
			console.error(error);
			await showAlert("Error al generar la factura PDF", {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ─────── HTML Factura Compra ──────── */

	const generarHTMLFacturaCompra = (datosCompra) => {
	const insumos = datosCompra.Insumos || [];
	const productos = datosCompra.Productos || [];
	const proveedor = datosCompra.Proveedor || {};

	const formatCOP = (value) => {
		if (!value && value !== 0) return "$0";
		return `$${Number(value).toLocaleString("es-CO")}`;
	};

	const formatFecha = (fecha) => {
		return new Date(fecha).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
		});
	};

	return `
		<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 20px;">
		<!-- Header -->
		<div style="text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
			<div style="font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px;">TBH - Compras</div>
			<div style="font-size: 24px; font-weight: bold; color: #666;">FACTURA DE COMPRA</div>
		</div>

		<!-- Información -->
		<div style="margin-bottom: 30px;">
			<p><strong>ID Compra:</strong> COM_${datosCompra.Id_Compras}</p>
			<p><strong>Fecha:</strong> ${formatFecha(datosCompra.Fecha)}</p>
			<p><strong>Proveedor:</strong> ${proveedor.Nombre_Empresa || proveedor.Nombre || "-"}</p>
			<p><strong>Asesor:</strong> ${proveedor.Asesor || "-"}</p>
			<p><strong>Email:</strong> ${proveedor.Email || "-"}</p>
			<p><strong>Teléfono Empresa:</strong> ${proveedor.Celular_Empresa || "-"}</p>
			<p><strong>Teléfono Asesor:</strong> ${proveedor.Celular_Asesor || "-"}</p>
			<p><strong>Dirección:</strong> ${proveedor.Direccion || "-"}</p>
			<p><strong>Estado:</strong> ${datosCompra.Estado ? "Activo" : "Inactivo"}</p>
		</div>

		<!-- Insumos -->
		${
			insumos.length > 0
			? `
			<h3>Insumos</h3>
			<br>
			<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
			<thead>
				<tr style="background-color: #f8f9fa;">
				<th style="border: 1px solid #ddd; padding: 8px;">ID</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Precio/ml</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Subtotal</th>
				</tr>
			</thead>
			<tbody>
				${insumos
				.map(
					(i) => `
				<tr>
					<td style="border: 1px solid #ddd; padding: 8px;">${i.Id_Insumos}</td>
					<td style="border: 1px solid #ddd; padding: 8px;">${i.Nombre}</td>
					<td style="border: 1px solid #ddd; padding: 8px;">${i.Cantidad}</td>
					<td style="border: 1px solid #ddd; padding: 8px;">${formatCOP(i.Precio_ml)}</td>
					<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${formatCOP(i.Subtotal)}</td>
				</tr>`
				)
				.join("")}
			</tbody>
			</table>
			`
			: ""
		}

		<!-- Productos -->
		${
			productos.length > 0
			? `
			<h3>Productos</h3>
			<br>
			<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
			<thead>
				<tr style="background-color: #f8f9fa;">
				<th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Precio Unitario</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Subtotal</th>
				<th style="border: 1px solid #ddd; padding: 8px;">Tallas</th>
				</tr>
			</thead>
			<tbody>
				${productos
				.map(
					(p) => `
				<tr>
					<td style="border: 1px solid #ddd; padding: 8px;">${p.Nombre}</td>
					<td style="border: 1px solid #ddd; padding: 8px;">${p.Cantidad}</td>
					<td style="border: 1px solid #ddd; padding: 8px;">${formatCOP(p.Precio_Unitario)}</td>
					<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${formatCOP(p.Subtotal)}</td>
					<td style="border: 1px solid #ddd; padding: 8px;">
					${
						p.Tallas && p.Tallas.length > 0
						? p.Tallas.map((t) => `${t.Talla}: ${t.Cantidad}`).join(", ")
						: "-"
					}
					</td>
				</tr>`
				)
				.join("")}
			</tbody>
			</table>
			`
			: ""
		}

		<!-- Total -->
		<div style="text-align: right; margin-top: 30px; font-size: 20px; font-weight: bold; color: #333;">
			TOTAL: ${formatCOP(datosCompra.Total)}
		</div>

		<!-- Footer -->
		<div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
			<p>Factura de Compra generada el ${formatFecha(new Date())}</p>
		</div>
		</div>
	`;
	};

	return (
		<GeneralTable
			title="Compras"
			columns={columns}
			data={compras}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onCancel={handleToggleEstado}
			onGenerarFactura={generarFacturaPDF}
			idAccessor="Id_Compras"
			stateAccessor="Estado"
		/>
	);
};

export default Compras;
