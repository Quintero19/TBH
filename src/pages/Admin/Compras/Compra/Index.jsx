import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { comprasService } from "@/service/compras.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

	return (
		<GeneralTable
			title="Compras"
			columns={columns}
			data={compras}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onCancel={handleToggleEstado}
			idAccessor="Id_Compras"
			stateAccessor="Estado"
		/>
	);
};

export default Compras;
