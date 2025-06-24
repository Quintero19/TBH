import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { catProductoService } from "@/service/categoriaProducto.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CategoriasProducto = () => {
	const [catsproducto, setCatsProducto] = useState([]);
	const navigate = useNavigate();
	const canEdit = (categoria) => categoria.Estado === true;
	const canDelete = (categoria) => categoria.Estado === true;

	const columns = [
		{ header: "ID", accessor: "Id_Categoria_Producto" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Descripción", accessor: "Descripcion" },
		{ header: "Es Ropa?", accessor: "Es_Ropa" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ──────── Cargar Categorias ──────── */

	const fetchCatsProducto = useCallback(async () => {
		try {
			const response = await catProductoService.obtenerCategorias();
			setCatsProducto(transformData(response.data));
		} catch (error) {
			const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
			showAlert(`Error: ${mensaje || error}`, {
				title: "Error",
				icon: "error",})
		}
	}, []);

	useEffect(() => {
		fetchCatsProducto();
	}, [fetchCatsProducto]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => ({
				...item,
				Es_Ropa: item.Es_Ropa ? "Si" : "No",
			})),
		[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		try {
			await catProductoService.actualizarEstadoCategoria(id);
			await fetchCatsProducto();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/categoriaproducto/agregar");
	};

	/* ─────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (categoria) => {
		try {
			const html = `
				<div class="space-y-7 text-gray-100">
					<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
					<h3 class="text-xl font-bold text-white">Detalles de la Categoría</h3>
					<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
						ID: ${categoria.Id_Categoria_Producto ?? "N/A"}
					</span>
					</div>

					<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
					<!-- Nombre -->
					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Nombre
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${categoria.Nombre ?? "-"}</div>
						</div>
					</div>

					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Estado
						</label>
						<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
							categoria.Estado
								? "bg-[#112d25] border-emerald-500/30"
								: "bg-[#2c1a1d] border-rose-500/30"
						}">
						<div class="font-medium ${
							categoria.Estado ? "text-emerald-300" : "text-rose-300"
						}">
							${categoria.Estado ? "Activo" : "Inactivo"}
						</div>
						</div>
					</div>

					<div class="relative md:col-span-2">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Descripción
						</label>
						<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
						<div class="text-gray-200 ${!categoria.Descripcion ? "italic text-gray-400" : ""}">
							${categoria.Descripcion || "No hay descripción disponible"}
						</div>
						</div>
					</div>
					</div>

					<div class="relative md:col-span-2">
						<label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">
							Productos Relacionados
						</label>


						<div class="rounded-lg border border-gray-600/50 pb-3 px-4 bg-[#111827] max-h-48 overflow-y-auto">
							${
								categoria.Productos.length > 0
								? `
									<table class="w-full text-left text-base text-gray-200">
										<thead class="sticky top-0 z-20 bg-[#111827] text-gray-300 text-sm uppercase tracking-wide shadow">
											<tr>
												<th class="py-3 px-4">ID</th>
												<th class="py-3 px-4">Nombre</th>
											</tr>
										</thead>
										<tbody>
											${categoria.Productos.map(p => `
												<tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
													<td class="py-3 px-4">${p.Id_Productos}</td>
													<td class="py-3 px-4">${p.Nombre}</td>
												</tr>
											`).join("")}
										</tbody>
									</table>
								`
								: `<p class="italic text-gray-400 text-base">No hay productos asociados</p>`
							}
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
			console.error("Error al obtener la categoria:", error);
			showAlert(
				`No se pudieron cargar los detalles de la categoria: ${error}`,
				{
					type: "error",
					title: "Error",
				},
			);
		}
	};

	/* ──────────────────────────────────── */

	/* ──────────── Ir a Editar ─────────── */

	const handleEdit = (categoria) => {
		navigate(
			`/admin/categoriaproducto/editar/${categoria.Id_Categoria_Producto}`,
		);
	};

	/* ──────────────────────────────────── */

	/* ───────────── Eliminar ───────────────*/

	const handleDelete = async (categoria) => {
		const result = await window.showAlert(
			`¿Deseas eliminar la categoria <strong>"${categoria.Nombre}"</strong>?`,
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
				await catProductoService.eliminarCategoria(
					categoria.Id_Categoria_Producto,
				);

				await window.showAlert("Categoria eliminada correctamente", {
					title: "Eliminada",
					type: "success",
					duration: 2000,
				});

				fetchCatsProducto();
			} catch (error) {
				console.error("Error Eliminando Categoria:", error);
				const mensaje =
					error.response?.data?.message || "Error al Eliminar la Categoria";

				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};

	/* ──────────────────────────────────── */

	return (
		<GeneralTable
			title="Categorias Producto"
			columns={columns}
			data={catsproducto}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Categoria_Producto"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
		/>
	);
};

export default CategoriasProducto;
