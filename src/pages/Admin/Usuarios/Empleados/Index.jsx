import { React, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GeneralTable from "@/components/GeneralTable";
import { empleadoService } from "@/service/empleado.service";
import { showAlert } from "@/components/AlertProvider";

const Empleados = () => {
	const [empleados, setEmpleados] = useState([]);
	const navigate = useNavigate();

	const canEdit = (empleado) => empleado.Estado === true;
	const canDelete = (empleado) => empleado.Estado === true;

	const columns = [
		{ header: "Documento", accessor: "Documento" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Celular", accessor: "Celular" },
		{ header: "Estado", accessor: "Estado" },
	];

	const fetchEmpleados = useCallback(async () => {
		try {
			const response = await empleadoService.obtenerEmpleados();
			setEmpleados(response.data);
		} catch (error) {
			console.error("Error al obtener empleados:", error.response?.data || error);
			showAlert("No se pudieron cargar los empleados", {
				type: "error",
				title: "Error",
			});
		}
	}, []);

	useEffect(() => {
		fetchEmpleados();
	}, [fetchEmpleados]);

	const handleToggleEstado = async (id) => {
		try {
			await empleadoService.actualizarEstadoEmpleado(id);
			await fetchEmpleados();
		} catch (error) {
			console.error("Error actualizando estado:", error);
			showAlert("No se pudo cambiar el estado del empleado", {
				type: "error",
				title: "Error",
			});
		}
	};

	const handleAdd = () => {
		navigate("/admin/empleado/agregar");
	};

	const handleVerDetalles = async (empleado) => {
		try {
			const html = `
				<div class="text-left">
					<p><strong>Documento:</strong> ${empleado.Documento || "-"}</p>
					<p><strong>Nombre:</strong> ${empleado.Nombre || "-"}</p>
					<p><strong>Celular:</strong> ${empleado.Celular || "-"}</p>
					<p><strong>Estado:</strong> ${empleado.Estado ? "Activo" : "Inactivo"}</p>
				</div>
			`;

			await showAlert(html, {
				type: "info",
				title: `Detalles Empleado`,
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			showAlert("No se pudieron cargar los detalles del empleado", {
				type: "error",
				title: "Error",
			});
		}
	};

	const handleEdit = (empleado) => {
		navigate(`/admin/empleado/editar/${empleado.Id_Empleados}`);
	};

	const handleDelete = async (empleado) => {
		const result = await showAlert(
			`¿Deseas eliminar al empleado <strong>${empleado.Nombre}</strong>?`,
			{
				type: "warning",
				title: "¿Estás seguro?",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: "Sí, eliminar",
				cancelButtonText: "Cancelar",
			}
		);

		if (result.isConfirmed) {
			try {
				await empleadoService.eliminarEmpleado(empleado.Id_Empleados);

				await showAlert("Empleado eliminado correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 1500,
				});

				fetchEmpleados();
			} catch (error) {
				console.error("Error al eliminar empleado:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el empleado";

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
			title="Empleados"
			columns={columns}
			data={empleados}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Empleados"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
		/>
	);
};

export default Empleados;
