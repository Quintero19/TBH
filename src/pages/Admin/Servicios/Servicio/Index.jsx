import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import { servicioService } from "../../../../service/serviciosService";

const columns = [
	{ header: "Id_Servicios", accessor: "Id_Servicios" },
	{ header: "Nombre", accessor: "Nombre" },
	{ header: "Precio", accessor: "Precio" },
	{ header: "Duracion ", accessor: "Duracion" },
	{ header: "Estado", accessor: "Estado" },
];

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

	const fetchServicios = useCallback(async () => {
		try {
			const response = await servicioService.obtenerServicios();
			console.log(response);
			setServicios(transformData(response.data));
		} catch (error) {
			console.error(
				"Error al obtener Servicios:",
				error.response?.data || error,
			);
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
		navigate("/admin/servicios/agregar"); //cambiar ruta
	};

	const handleVerDetalles = async (Servicios) => {
		try {
			Swal.fire({
				title: `Detalles Servicio ID: ${Servicios.Id_Servicios}`,
				html: `
          <div class="text-left">
            <p><strong>nombre :</strong> ${Servicios.Nombre || "-"}</p>
            <p><strong>precio:</strong> ${Servicios.Precio != null ? Math.floor(Servicios.Precio) : "-"}</p>
            <p><strong>Duracion:</strong> ${Servicios.Duracion} min</p>
            <p><strong>Descripcion:</strong> ${Servicios.Descripcion || "-"}</p>
            <p><strong>Estado:</strong> ${Servicios.Estado ? "Activo" : "Inactivo"}</p>
          </div>
      `,
				icon: "info",
				confirmButtonText: "Cerrar",
				padding: "1rem",
				confirmButtonColor: "#3085d6",
				background: "#000",
				color: "#fff",
			});
		} catch (error) {
			console.error("Error al obtener el Servicios:", error);
			Swal.fire(
				"Error",
				"No se pudieron cargar los detalles del Servicios",
				"error",
			);
		}
	};

	const handleEdit = (Servicios) => {
		navigate(`/admin/servicios/editar/${Servicios.Id_Servicios}`); // cambiar ruta
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
			/>
		</>
	);
};

export default Servicios;
