import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { empleadoService } from "@/service/empleado.service";

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

	const transformData = useCallback((data) => {
		return data.map((item) => ({
			...item,
		}));
	}, []);

	const fetchEmpleados = useCallback(async () => {
		try {
			const response = await empleadoService.obtenerEmpleados();
			setEmpleados(transformData(response.data));
		} catch (error) {
					const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
					showAlert(`Error: ${mensaje || error}`, {
						title: "Error",
						icon: "error",})
			}
	}, [transformData]);

	useEffect(() => {
		fetchEmpleados();
	}, [fetchEmpleados]);

	const handleToggleEstado = async (id) => {
		try {
			await empleadoService.actualizarEstadoEmpleado(id);
			await fetchEmpleados();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
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
		<div class="space-y-7 text-gray-100">
			<!-- Encabezado -->
			<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
				<h3 class="text-xl font-bold text-white">Detalles de Empleado</h3>
				<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
					ID: ${empleado.Id_Empleados ?? "N/A"}
				</span>
			</div>

			<!-- Campos -->
			<div class="grid grid-cols-1 gap-7 md:grid-cols-2">

				<!-- Tipo Documento -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Tipo Documento
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${empleado.Tipo_Documento ?? "-"}</div>
					</div>
				</div>

				<!-- Documento -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Documento
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${empleado.Documento ?? "-"}</div>
					</div>
				</div>

				<!-- Nombre -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Nombre
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${empleado.Nombre ?? "-"}</div>
					</div>
				</div>

				<!-- Celular -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Celular
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${empleado.Celular ?? "-"}</div>
					</div>
				</div>

				<!-- F. Nacimiento -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Fecha de Nacimiento
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${empleado.F_Nacimiento ?? "-"}</div>
					</div>
				</div>

				<!-- Sexo -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Sexo
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${empleado.Sexo ?? "-"}</div>
					</div>
				</div>

				<!-- Dirección -->
				<div class="relative md:col-span-2">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Dirección
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="text-white">${empleado.Direccion ?? "-"}</div>
					</div>
				</div>

				<!-- Estado -->
				<div class="relative md:col-span-2">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
						Estado
					</label>
					<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
						empleado.Estado
							? "bg-[#112d25] border-emerald-500/30"
							: "bg-[#2c1a1d] border-rose-500/30"
					}">
						<div class="font-medium ${
							empleado.Estado ? "text-emerald-300" : "text-rose-300"
						}">
							${empleado.Estado ? "Activo" : "Inactivo"}
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
					duration: 2000,
				});

				fetchEmpleados();
			} catch (error) {
				console.error("Error Eliminando Empleado:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el empleado";

				showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
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
			addButtonText="Nuevo Empleado"
		/>
	);
};

export default Empleados;
