import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { empleadoService } from "../../../../service/empleado.service";

const columns = [
	{ header: "Documento", accessor: "Documento" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Celular", accessor: "Celular" },
	{ header: "Estado", accessor: "Estado" },
];

const Empleados = () => {
	const [empleados, setEmpleados] = useState([]);
	const navigate = useNavigate();

	const fetchEmpleados = useCallback(async () => {
		try {
			const response = await empleadoService.obtenerEmpleados();
			console.log("Datos empleados API:", response.data);
			setEmpleados(response.data);
		} catch (error) {
			console.error(
				"Error al obtener empleados:",
				error.response?.data || error,
			);
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
		}
	};

	const handleAdd = () => {
		navigate("/admin/empleado/agregar");
	};

	const handleVerDetalles = (empleado) => {
		Swal.fire({
			title: `Empleado: ${empleado.Nombre}`,
			html: `
        <p><strong>Documento:</strong> ${empleado.Documento}</p>
        <p><strong>Celular:</strong> ${empleado.Celular}</p>
        <p><strong>Estado:</strong> ${empleado.Estado === true || empleado.Estado === 1 ? "Activo" : "Inactivo"}</p>
      `,
			icon: "info",
			confirmButtonText: "Cerrar",
			background: "#000",
			color: "#fff",
		});
	};

	const handleEdit = (empleado) => {
		navigate(`/admin/empleado/editar/${empleado.Id_Empleados}`);
	};

	const handleDelete = async (empleado) => {
		console.log("Empleado a eliminar:", empleado);
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al empleado "${empleado.Nombre}"?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
			background: "#000",
			color: "#fff",
		});

		if (result.isConfirmed) {
			try {
				await empleadoService.eliminarEmpleado(empleado.Id_Empleados);
				await Swal.fire({
					title: "Eliminado",
					text: "Empleado eliminado correctamente",
					icon: "success",
					timer: 1000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
				fetchEmpleados();
			} catch (error) {
				console.error("Error al eliminar empleado:", error);
				Swal.fire({
					title: "Error",
					text: error.response?.data?.message || "No se pudo eliminar",
					icon: "error",
					timer: 2500,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
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
		/>
	);
};

export default Empleados;
