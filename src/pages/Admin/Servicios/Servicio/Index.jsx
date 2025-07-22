import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { servicioService } from "../../../../service/serviciosService";
import { showAlert } from "@/components/AlertProvider";
import CarruselImagenes from "@/components/CarruselImagenes";

const columns = [
	{ header: "Id_Servicios", accessor: "Id_Servicios" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Precio", accessor: "Precio" },
	{ header: "Duracion ", accessor: "Duracion" },
	{ header: "Estado", accessor: "Estado" },
];
const canEdit = (servicios) => servicios.Estado === true;
const canDelete = (servicios) => servicios.Estado === true;

const transformData = (data) => {
	return data.map((item) => {
		return {
			...item,
			Precio: item.Precio != null ? Math.floor(item.Precio) : "-",
		};
	});
};

const Servicios = () => {
	const [servicios, setServicios] = useState([]);
	const navigate = useNavigate();
	const [mostrarCarrusel, setMostrarCarrusel] = useState(false);
	const [imagenesActuales, setImagenesActuales] = useState([]);

	const fetchServicios = useCallback(async () => {
		try {
			const response = await servicioService.obtenerServicios();
			console.log(response);
			setServicios(transformData(response.data));
		} catch (error) {
			const mensaje =
				error.response?.data?.message || "Error al obtener los usuarios.";
			showAlert(`Error: ${mensaje || error}`, {
				title: "Error",
				icon: "error",
			});
		}
	}, []);

	const handleToggleEstado = async (id) => {
		try {
			await servicioService.actualizarEstadoServicios(id);
			await fetchServicios();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	useEffect(() => {
		fetchServicios();
	}, [fetchServicios]);

	const handleAdd = () => {
		navigate("/admin/servicios/agregar");
	};

	const handleVerDetalles = async (Servicios) => {
		try {
			const html = `
    <div class="space-y-7 text-gray-100">
      <!-- Encabezado -->
      <div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
        <h3 class="text-xl font-bold text-white">Detalles de Servicio</h3>
        <span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
          ID: ${Servicios.Id_Servicios ?? "N/A"}
        </span>
      </div>

      <!-- Campos -->
      <div class="grid grid-cols-1 gap-7 md:grid-cols-2">

        <!-- Nombre -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Nombre
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${Servicios.Nombre ?? "-"}</div>
          </div>
        </div>

        <!-- Precio -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Precio
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${Servicios.Precio != null ? Math.floor(Servicios.Precio) : "-"}</div>
          </div>
        </div>

        <!-- Duración -->
        <div class="relative">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Duración
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="font-medium text-white">${Servicios.Duracion ?? "-"} min</div>
          </div>
        </div>

        <!-- Descripción -->
        <div class="relative md:col-span-2">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Descripción
          </label>
          <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
            <div class="text-white">${Servicios.Descripcion ?? "-"}</div>
          </div>
        </div>

        <!-- Estado -->
        <div class="relative md:col-span-2">
          <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
            Estado
          </label>
          <div class="rounded-lg border pt-4 pb-2.5 px-4 ${
						Servicios.Estado
							? "bg-[#112d25] border-emerald-500/30"
							: "bg-[#2c1a1d] border-rose-500/30"
					}">
            <div class="font-medium ${
							Servicios.Estado ? "text-emerald-300" : "text-rose-300"
						}">
              ${Servicios.Estado ? "Activo" : "Inactivo"}
            </div>
          </div>
        </div>

      </div>
    </div>
    `;

			Swal.fire({
				title: `Detalles del Servicio`,
				html: html,
				icon: "info",
				showConfirmButton: false, // Esta línea elimina el botón "Cerrar"
				padding: "1rem",
				background: "#111827",
				color: "#fff",
				width: "600px",
				timer: 3000, // La ventana se cerrará automáticamente después de 3 segundos
			});
		} catch (error) {
			console.error("Error al obtener el Servicio:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudieron cargar los detalles del Servicio",
				icon: "error",
				showConfirmButton: false,
				timer: 3000,
			});
		}
	};

	const handleEdit = (Servicios) => {
		navigate(`/admin/servicios/editar/${Servicios.Id_Servicios}`);
	};

	const handleDelete = async (Servicios) => {
		const result = await Swal.fire({
			title: "¿Estás seguro?",
			text: `¿Deseas eliminar al Servicio "${Servicios.Nombre}"?`,
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
				await servicioService.eliminarServicios(Servicios.Id_Servicios);

				await Swal.fire({
					title: "Eliminado",
					text: "Servicios eliminado correctamente",
					icon: "success",
					timer: 2000,
					showConfirmButton: false,
					background: "#000",
					color: "#fff",
				});

				fetchServicios();
			} catch (error) {
				console.error("Error Eliminando Servicios:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el Servicios";

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

	const verImagenes = (servicio) => {
		console.log("Servicio recibido:", servicio);
		if (!servicio?.Imagenes?.length) return;

		const urls = servicio.Imagenes.map((img) => img.URL);
		setImagenesActuales(urls);
		setMostrarCarrusel(true);
	};

	return (
		<>
			<GeneralTable
				title="Servicios"
				columns={columns}
				data={servicios}
				onAdd={handleAdd}
				onView={handleVerDetalles}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onToggleEstado={handleToggleEstado}
				idAccessor="Id_Servicios"
				stateAccessor="Estado"
				canEdit={canEdit}
				canDelete={canDelete}
				verImagenes={verImagenes}
			/>
			<CarruselImagenes
				imagenes={imagenesActuales}
				visible={mostrarCarrusel}
				onClose={() => setMostrarCarrusel(false)}
			/>
		</>
	);
};

export default Servicios;
