import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { horariosService } from "@/service/horarios.service";
const columns = [
	{ header: "Codigo Novedad", accessor: "Id_Novedades_Horarios" },
	{ header: "Código Empleado", accessor: "CodigoSecuencial" }, // Este es el número consecutivo
	{ header: "Fecha", accessor: "Fecha" },
	{ header: "Hora Inicio", accessor: "Hora_Inicio" },
	{ header: "Hora Fin", accessor: "Hora_Fin" },
	{ header: "Motivo", accessor: "Motivo" },
];

const canEdit = (horario) => true;
const canDelete = (horario) => true;

const transformData = (data) => {
	return data.map((item, index) => {
		return {
			...item,
			CodigoSecuencial: index + 1, // empieza en 1
			Fecha: new Date(item.Fecha).toLocaleDateString(),
			Hora_Inicio: item.Hora_Inicio?.substring(1, 5) || "-",
			Hora_Fin: item.Hora_Fin?.substring(1, 5) || "-",
		};
	});
};

const HorariosNovedades = () => {
	const [horarios, setHorarios] = useState([]);
	const navigate = useNavigate();

	const fetchHorarios = useCallback(async () => {
		try {
			const response = await horariosService.obtenerNovedadesHorarios();
			setHorarios(transformData(response.data));
		} catch (error) {
			const mensaje =
				error.response?.data?.message ||
				"Error al obtener las novedades de horarios.";
			Swal.fire({
				title: "Error",
				text: `Error: ${mensaje || error}`,
				icon: "error",
				background: "#000",
				color: "#fff",
			});
		}
	}, []);

	const handleAdd = () => {
		navigate("/admin/horarios-novedades/agregar");
	};

	const handleVerDetalles = async (horarios) => {
		try {
			const html = `
    <div class="space-y-7 text-gray-100">
      <!-- Encabezado -->
      <div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
        <h3 class="text-xl font-bold text-white">Detalles de la novedad</h3>
        <span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
          ID: ${horarios.Id_Novedades_Horarios ?? "N/A"}
        </span>
      </div>

      <!-- Campos -->
      <div class="grid grid-cols-1 gap-7 md:grid-cols-2">

        
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Codigo Empleado
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${horarios.Id_Empleados ?? "-"}</div>
          </div>
        </div>

        <!-- Documento -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Fecha
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${horarios.Fecha ?? "-"}</div>
          </div>
        </div>

        <!-- Nombre -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Hora Inicio
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${horarios.Hora_Inicio ?? "-"}</div>
          </div>
        </div>

        <!-- Celular -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Hora Fin
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${horarios.Hora_Fin ?? "-"}</div>
          </div>
        </div>

        <!-- F. Nacimiento -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Fecha de Nacimiento
          </label>
          <div class="border border-gray-600/wor0 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${horarios.Motivo ?? "-"}</div>
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

	const handleEdit = (horario) => {
		navigate(
			`/admin/horarios-novedades/editar/${horario.Id_Novedades_Horarios}`,
		);
	};

	const handleDelete = async (horario) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar la novedad del empleado ${horario.Id_Empleados}?`,
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
				await horariosService.eliminarNovedadHorario(
					horario.Id_Novedades_Horarios,
				);

				await Swal.fire({
					title: "Eliminado",
					text: "Novedad eliminada correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});

				fetchHorarios();
			} catch (error) {
				console.error("Error eliminando novedad:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar la novedad";

				Swal.fire({
					title: "Error",
					text: mensaje,
					icon: "error",
					timer: 2500,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});
			}
		}
	};

	useEffect(() => {
		fetchHorarios();
	}, [fetchHorarios]);

	return (
		<>
			<GeneralTable
				title="Novedades"
				columns={columns}
				data={horarios}
				onAdd={handleAdd}
				onView={handleVerDetalles}
				onEdit={handleEdit}
				onDelete={handleDelete}
				idAccessor="Id_Novedades_Horarios"
				canEdit={canEdit}
				canDelete={canDelete}
			/>
		</>
	);
};

export default HorariosNovedades;
