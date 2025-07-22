import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { tamanosService } from "@/service/tamanos.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tamanos = () => {
	const [tamanos, setTamanos] = useState([]);
	const canEdit = (tamanos) => tamanos.Estado === true;
	const canDelete = (tamanos) => tamanos.Estado === true;
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Tamano" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Cantidad (ml)", accessor: "Cantidad_Maxima" },
		{ header: "Precio de Venta", accessor: "Precio_Venta" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ───────── Cargar Tamaños ────────── */

	const fetchTamanos = useCallback(async () => {
		try {
			const response = await tamanosService.obtenerTamanos();
			setTamanos(transformData(response.data));
		} catch (error) {
			const mensaje =
				error.response?.data?.message || "Error al obtener los tamaños.";
			showAlert(`Error: ${mensaje || error}`, {
				title: "Error",
				icon: "error",
			});
		}
	}, []);

	useEffect(() => {
		fetchTamanos();
	}, [fetchTamanos]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => {
				const precio = Number(item.Precio_Venta) || 0;

				const insumos =
					item.Insumos?.map((insumo) => ({
						...insumo,
						Cantidad: Math.floor(Number(insumo.Cantidad)),
					})) || [];

				return {
					...item,
					Precio_Venta: precio.toLocaleString("es-CO", {
						style: "currency",
						currency: "COP",
						minimumFractionDigits: 0,
						maximumFractionDigits: 0,
					}),
					Insumos: insumos,
				};
			}),
		[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		try {
			await tamanosService.actualizarEstadoTamano(id);
			await fetchTamanos();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);

			showAlert(`Error Cambiando Estado del Tamano: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/tamanos/agregar");
	};

	/* ──────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (tamano) => {
		console.log(tamano);
		try {
			const html = `
				<div class="space-y-7 text-gray-100">
					<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
					<h3 class="text-xl font-bold text-white">Detalles del Tamaño</h3>
					<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
						ID: ${tamano.Id_Tamano ?? "N/A"}
					</span>
					</div>

					<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
					<!-- Nombre -->
					<div class="relative md:col-span-2">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Nombre
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${tamano.Nombre ?? "-"}</div>
						</div>
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Nombre
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${tamano.Nombre ?? "-"}</div>
						</div>
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Estado
						</label>
						<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
							tamano.Estado
								? "bg-[#112d25] border-emerald-500/30"
								: "bg-[#2c1a1d] border-rose-500/30"
						}">
						<div class="font-medium ${
							tamano.Estado ? "text-emerald-300" : "text-rose-300"
						}">
							${tamano.Estado ? "Activo" : "Inactivo"}
						</div>
						</div>
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Cantidad Maxima
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${tamano.Cantidad_Maxima ?? "-"}</div>
						</div>
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Precio de Venta
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${tamano.Precio_Venta ?? "-"}</div>
						</div>
					</div>

					<div class="relative md:col-span-2">
						<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">
							Insumos Relacionados
						</label>

						<div class="rounded-lg border border-gray-600/50 px-4 bg-[#111827] pt-4">
							<!-- Scroll solo a la tabla -->
							<div class="max-h-60 overflow-y-auto">
								${
									tamano.Insumos.length > 0
										? `
								<table class="w-full table-fixed text-left text-base text-gray-200">
									<thead class="sticky top-0 z-20 bg-[#111827] text-gray-300 text-sm uppercase tracking-wide shadow">
										<tr>
											<th class="py-3 px-4 w-1/6">ID</th>
											<th class="py-3 px-4 w-2/6">Nombre</th>
											<th class="py-3 px-4 w-3/6">Cantidad de Consumo</th>
										</tr>
									</thead>
									<tbody>
										${tamano.Insumos.map(
											(i) => `
											<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
												<td class="py-3 px-4">${i.Id_Insumos}</td>
												<td class="py-3 px-4">${i.Nombre}</td>
												<td class="py-3 px-10">${i.Cantidad}</td>
											</tr>
										`,
										).join("")}
									</tbody>
								</table>
									`
										: `<p class="italic text-gray-400 text-base">No hay productos asociados</p>`
								}
							</div>
						</div>
					</div>

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
			showAlert(`No se pudieron cargar los detalles del tamaño: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ──────────── Ir a Editar ─────────── */

	const handleEdit = (tamano) => {
		navigate(`/admin/tamanos/editar/${tamano.Id_Tamano}`);
	};

	/* ───────────────────────────────────── */

	/* ───────────── Eliminar ───────────────*/

	const handleDelete = async (tamano) => {
		const result = await window.showAlert(
			`¿Deseas eliminar el tamaño ${tamano.Nombre}</strong>?`,
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
				await tamanosService.eliminarTamano(tamano.Id_Tamano);

				await window.showAlert("Tamaño eliminado correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchTamanos();
			} catch (error) {
				console.error("Error eliminando tamaño:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el tamaño";

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
			title="Tamaños"
			columns={columns}
			data={tamanos}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Tamano"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
			return={returnProductos}
		/>
	);
};

export default Tamanos;
