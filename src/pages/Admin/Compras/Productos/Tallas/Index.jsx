import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { catProductoService } from "@/service/categoriaProducto.service";
import { tallasService } from "@/service/tallas.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tallas = () => {
	const [tallas, setTallas] = useState([]);
	const canEdit = (tallas) => tallas.Estado === true;
	const canDelete = (tallas) => tallas.Estado === true;
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Tallas" },
		{ header: "Categoria de Producto", accessor: "Categoria" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ────────── Cargar Tallas ────────── */

	const fetchTallas = useCallback(async () => {
		try {
			const response = await tallasService.obtenerTallas();
			setTallas(response.data);
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
		fetchTallas();
	}, [fetchTallas]);

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
				<div class="space-y-7 text-gray-100">
					<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
					<h3 class="text-xl font-bold text-white">Detalles de la Talla</h3>
					<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
						ID: ${talla.Id_Tallas ?? "N/A"}
					</span>
					</div>

					<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
					<!-- Nombre -->
					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Nombre
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${talla.Nombre ?? "-"}</div>
						</div>
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Estado
						</label>
						<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
							talla.Estado
								? "bg-[#112d25] border-emerald-500/30"
								: "bg-[#2c1a1d] border-rose-500/30"
						}">
						<div class="font-medium ${
							talla.Estado ? "text-emerald-300" : "text-rose-300"
						}">
							${talla.Estado ? "Activo" : "Inactivo"}
						</div>
						</div>
					</div>

					<div class="relative md:col-span-2">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Categoria de Producto
						</label>
						<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
						<div class="font-medium text-white">
							${talla.Categoria || "-"}
						</div>
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
			},
		);

		if (result.isConfirmed) {
			try {
				await tallasService.eliminarTalla(talla.Id_Tallas);

				await window.showAlert("Talla eliminada correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchTallas();
			} catch (error) {
				console.error("Error Eliminando Talla:", error);
				const mensaje =
					error.response?.data?.message || "Error al Eliminar la Talla";

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
			canEdit={canEdit}
			canDelete={canDelete}
			return={returnProductos}
		/>
	);
};

export default Tallas;
