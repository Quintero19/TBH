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
	{ header: "Stock (Unidades)", accessor: "Stock" },
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
		}));
		setInsumos(datosProcesados);
		console.log("Insumos cargados:", datosProcesados);
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
	// const handleDelete = async (insumo) => {
	// 	try {
	// 		const result = await showAlert(
	// 			`¿Deseas eliminar el insumo <strong>${insumo.Nombre}</strong>?`,
	// 			{
	// 				type: "warning",
	// 				title: "Confirmar",
	// 				showConfirmButton: true,
	// 				showCancelButton: true,
	// 				confirmButtonText: "Sí, eliminar",
	// 				cancelButtonText: "Cancelar",
	// 			},
	// 		);

	// 		if (result.isConfirmed) {
	// 			await insumoService.eliminarInsumo(insumo.Id_Insumos);
	// 			showAlert("Insumo eliminado correctamente", {
	// 				type: "success",
	// 				title: "Eliminado",
	// 			});
	// 			cargarInsumos();
	// 		}
	// 	} catch (err) {
	// 		console.error("No se pudo eliminar el insumo:", err);
	// 		showAlert("No se pudo eliminar el insumo", {
	// 			type: "error",
	// 			title: "Error",
	// 		});
	// 	}
	// };

	// --- Ver detalles de un insumo ---
	const handleVerDetalles = async (insumo) => {
		const html = `
		<div class="space-y-6 text-sm text-white">
		<div class="flex items-center justify-between border-b border-gray-600 pb-2">
			<h3 class="text-xl font-semibold">Información del Insumo</h3>
		</div>
		<div class="space-y-3">
			<div class="flex justify-between">
			<span class="font-medium text-gray-300">ID:</span>
			<span class="text-right text-gray-100">${insumo.Id_Insumos}</span>
			</div>
			<div class="flex justify-between">
			<span class="font-medium text-gray-300">Categoría:</span>
			<span class="text-right text-gray-100">${insumo.CategoriaNombre}</span>
			</div>
			<div class="flex justify-between">
			<span class="font-medium text-gray-300">Nombre:</span>
			<span class="text-right text-gray-100">${insumo.Nombre}</span>
			</div>
			<div class="flex justify-between">
			<span class="font-medium text-gray-300">Stock (Unidades):</span>
			<span class="text-right text-gray-100">${insumo.Stock}</span>
			</div>
			<div class="flex justify-between">
			<span class="font-medium text-gray-300">Estado:</span>
			<span class="text-right ${insumo.Estado ? "text-green-400" : "text-red-400"}">
				${insumo.Estado ? "Activo" : "Inactivo"}
			</span>
			</div>
		</div>
		</div>
	`;

		showAlert(html, {
			title: "Detalles del Insumo",
			confirmButtonText: "Cerrar",
			background: "#1f2937",
			color: "#ffffff",
			customClass: {
				confirmButton:
					"bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded",
				popup: "rounded-xl shadow-lg p-6",
			},
		});
	};

	// --- Validación para edición y eliminación ---
	const canEdit = (i) => i.Estado === true;
	const canDelete = (i) => i === false; //corregido paraque no se puedan eliminar insumos	

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
        // onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
        idAccessor="Id_Insumos"
      />
    </>
  );

};

export default InsumoAdmin;
