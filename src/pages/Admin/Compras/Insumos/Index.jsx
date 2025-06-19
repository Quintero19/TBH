import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { insumoService } from "@/service/insumo.service";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// --- Columnas para la tabla ---
const columns = [
	{ header: "ID", accessor: "Id_Insumos" },
	{ header: "Categoría", accessor: "CategoriaNombre" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Stock (Unidades)", accessor: "StockFormateado" },
	{ header: "Estado", accessor: "Estado" },
];

const InsumoAdmin = () => {
	const [insumos, setInsumos] = useState([]);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	// --- Función para cargar los insumos ---
	const cargarInsumos = useCallback(async () => {
	try {
		setError(null);
		const response = await insumoService.obtenerInsumos();
		const datosProcesados = response.data.map((i) => ({
			...i,
			CategoriaNombre: i.Id_Categoria_Insumos_Categoria_Insumo?.Nombre || "Sin categoría",
			StockFormateado: i.Stock?.toLocaleString("es-CO") ?? "0", // Ej: 12.000
		}));
		setInsumos(datosProcesados);
		// console.log("Insumos cargados:", datosProcesados);
	} catch (err) {
		console.error("Error al cargar insumos:", err);
		setError("Error al cargar insumos");
	}
}, []);

	// --- Cargar los insumos al montar el componente ---
	useEffect(() => {
		cargarInsumos();
	}, [cargarInsumos]);

	// --- Función para activar o desactivar el estado de un insumo ---
	const handleToggleEstado = async (id) => {
		try {
			const insumo = insumos.find((i) => i.Id_Insumos === id);
			await insumoService.actualizarEstadoInsumo(id, !insumo.Estado);
			cargarInsumos();
		} catch (err) {
			console.error("Error al cambiar el estado del insumo:", err);
			showAlert("Error al cambiar el estado del insumo", {
				type: "error",
				title: "Error",
			});
		}
	};

	// --- Navegar a agregar nuevo insumo ---
	const handleAdd = () => {
		navigate("/admin/insumo/agregar");
	};

	// --- Navegar a editar un insumo existente ---
	const handleEdit = (insumo) => {
		navigate(`/admin/insumo/editar/${insumo.Id_Insumos}`);
	};

	// --- Eliminar un insumo con confirmación ---
	const handleDelete = async (insumo) => {
		try {
			const result = await showAlert(
				`¿Deseas eliminar el insumo <strong>${insumo.Nombre}</strong>?`,
				{
					type: "warning",
					title: "Confirmar",
					showConfirmButton: true,
					showCancelButton: true,
					confirmButtonText: "Sí, eliminar",
					cancelButtonText: "Cancelar",
				},
			);

			if (result.isConfirmed) {
				await insumoService.eliminarInsumo(insumo.Id_Insumos);
				showAlert("Insumo eliminado correctamente", {
					type: "success",
					title: "Eliminado",
				});
				cargarInsumos();
			}
		} catch (err) {
			console.error("No se pudo eliminar el insumo:", err);
			showAlert("No se pudo eliminar el insumo", {
				type: "error",
				title: "Error",
			});
		}
	};

	// --- Ver detalles de un insumo ---
	const handleVerDetalles = async (insumo) => {
		try {
			const html = `
			<div class="space-y-7 text-gray-100">
				<!-- Encabezado -->
				<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
					<h3 class="text-xl font-bold text-white">Detalles del Insumo</h3>
					<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
						ID: ${insumo.Id_Insumos ?? "N/A"}
					</span>
				</div>

				<!-- Campos -->
				<div class="grid grid-cols-1 gap-7 md:grid-cols-2">

					<!-- Categoría -->
					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
							Categoría
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
							<div class="font-medium text-white">${insumo.CategoriaNombre || "Sin categoría"}</div>
						</div>
					</div>

					<!-- Nombre -->
					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
							Nombre
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
							<div class="font-medium text-white">${insumo.Nombre ?? "-"}</div>
						</div>
					</div>

					<!-- Stock -->
					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
							Stock (Unidades)
						</label>
						<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
							<div class="font-medium text-white">${insumo.Stock?.toLocaleString("es-CO") ?? "0"}</div>
						</div>
					</div>

					<!-- Estado -->
					<div class="relative">
						<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
							Estado
						</label>
						<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
							insumo.Estado
								? "bg-[#112d25] border-emerald-500/30"
								: "bg-[#2c1a1d] border-rose-500/30"
						}">
							<div class="font-medium ${
								insumo.Estado ? "text-emerald-300" : "text-rose-300"
							}">
								${insumo.Estado ? "Activo" : "Inactivo"}
							</div>
						</div>
					</div>

				</div>
			</div>
			`;

			await showAlert(html, {
				title: "",
				width: "640px",
				background: "#111827",
				color: "#ffffff",
				padding: "1.5rem",
				confirmButtonText: "Cerrar",
				confirmButtonColor: "#4f46e5",
				customClass: {
					popup: "rounded-xl shadow-2xl border border-gray-700/50",
					confirmButton: "px-6 py-2 font-medium rounded-lg mt-4",
				},
			});
		} catch (error) {
			console.error(error);
			await showAlert(`Error: ${error.message || error}`, {
				title: "Error",
				icon: "error",
				background: "#1f2937",
				color: "#ffffff",
				width: "500px",
				confirmButtonColor: "#dc2626",
			});
		}
	};


	// --- Validación para edición y eliminación ---
	const canEdit = (i) => i.Estado === true;
	const canDelete = (insumo) => !insumo.TieneCompras;

  // --- Renderizado del componente ---
  return (
    <>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <GeneralTable
        title="Insumos"
        columns={columns}
        data={insumos}
        onView={handleVerDetalles}
        onToggleEstado={handleToggleEstado}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
        idAccessor="Id_Insumos"
      />
    </>
  );

};

export default InsumoAdmin;
