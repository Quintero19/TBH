import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "../../../../../components/GeneralTable";
import { tamanosService } from "../../../../../service/tamanos.service";

const Tamanos = () => {

	const [tamanos, setTamanos] = useState([]);
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
			console.error(
				"Error al obtener los tamaños:",
				error.response?.data || error,
			);
		}
	}, []);

	useEffect(() => {
		fetchTamanos();
	}, [fetchTamanos]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista) =>
			lista.map((item) => ({
				...item,
				Precio_Venta: Number(item.Precio_Venta).toFixed(0),
			})),
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
			})
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
		try{
			const html = `
							<div class="text-left">
								<p><strong>Nombre:</strong> ${tamano.Nombre || "-"}</p>
								<p><strong>Cantidad Máxima:</strong> ${tamano.Cantidad_Maxima || "-"}</p>
								<p><strong>Precio de Venta:</strong> ${tamano.Precio_Venta || "-"}</p>
								<p><strong>Estado:</strong> ${tamano.Estado ? "Activo" : "Inactivo"}</p>
							</div>
			`;
			await showAlert(html,{
				title: `Detalles Tamaño ID: ${tamano.Id_Tamano}`,
				type: "info",
					showConfirmButton: true,
					swalOptions: {
						confirmButtonText: "Cerrar",
						padding: "1rem",
					}
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
		});

		if (result.isConfirmed) {
			try {
				await tamanosService.eliminarTamano(tamano.Id_Tamano);

				await window.showAlert("Tamaño eliminado correctamente",{
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});
				
				fetchTamanos();

			} catch (error) {
				console.error("Error eliminando tamaño:", error);
				const mensaje = error.response?.data?.message || "Error al eliminar el tamaño";
				
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
			return={returnProductos}
		/>
	);
};

export default Tamanos;
