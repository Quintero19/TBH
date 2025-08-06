import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { devolucionService } from "@/service/devolucion.service";
import { React, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Devolucion = () => {
	const [devolucion, setDevolucion] = useState([]);
	const navigate = useNavigate();

	const canEdit = (devolucion) => devolucion.Estado === true;
	const canDelete = (devolucion) => devolucion.Estado === true;

	const columns = [
		{ header: "ID_Devoluciones", accesor: "ID_Devoluciones" },
		{ header: "ID_Cliente", accesor: "ID_Cliente" },
		{ header: "Total", accesor: "Total" },
		{ header: "Fecha", accesor: "Fecha" },
		{ header: "Estado", accesor: "Estado" },
	];
	const fetchDevolucion = useCallback(async () => {
		try {
			const response = await devolucionService.obtenerDevolucion();
			setDevolucion(response.data);
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
		fetchDevolucion();
	}, [fetchDevolucion]);

	const handleToggleEstado = async (id) => {
		try {
			await devolucionService.actualizarEstadoDevolucion(id);
			await fetchDevolucion();
		} catch (error) {
			console.error("Error actualizando estado: ", error);
			showAlert("No se pudo cambiar el estado de la devolucion", {
				type: "error",
				title: "Error",
			});
		}
	};

	// const handleAdd = ()=>{
	//     navigate("/admin/devoluciones/agregar");
	// };

	const handleVerDetalles = async (devolucion) => {
		try {
			const htnl = `
                <div class="text-left">
					<p><strong>ID_Devoluciones:</strong> ${devolucion.ID_Devoluciones || "-"}</p>
					<p><strong>ID_Cliente:</strong> ${devolucion.ID_Cliente || "-"}</p>
					<p><strong>Total:</strong> ${devolucion.Total || "-"}</p>
                    <p><strong>Fecha:</strong> ${devolucion.Fecha || "-"}</p>
					<p><strong>Estado:</strong> ${devolucion.Estado ? "Activo" : "Inactivo"}</p>
				</div>
            `;
			await showAlert(html, {
				type: "info",
				title: "Detalle de la Devolucion",
				showConfirmButton: true,
				swallOptions: {
					ConfirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			showAlert("No se pudieron cargar los detalles de la devolucion", {
				type: "error",
				title: "Error",
			});
		}
	};

	// const handleEdit = (devolucion)=> {
	//     navigate(`/admin/devoluciones/editar/${devolucion.ID_Devoluciones}`);
	// };

	const handleDelete = async (devolucion) => {
		const result = await showAlert(
			`¿Desear eliminar la devolucion <strong>${devolucion.ID_Devoluciones}<strong>?`,
			{
				type: "warning",
				title: "¿Estas seguro?",
				showConfirmButton: true,
				showCancelButton: true,
				ConfirmButtonText: "Si,eliminar",
				cancelButtonText: "Cancelar",
			},
		);
		if (result.isConfirmed) {
			try {
				await devolucionService.eliminarDevolucion(devolucion.ID_Devoluciones);

				await showAlert("Devolucion Eliminada correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 1500,
				});
				fetchDevolucion();
			} catch (error) {
				console.error("Error al eliminar Devolucion:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar de devolucion";

				showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 1500,
				});
			}
		}
	};

	return (
		<GeneralTable
			title="Devoluciones"
			columns={columns}
			data={devolucion}
			// onAdd={handleAdd}
			onView={handleVerDetalles}
			// onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Devoluciones"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
		/>
	);
};

export default Devolucion;
