import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolPermisoService } from "@/service/asignacionPermiso";
import { permisoService } from "@/service/permisos.service";
import { rolService } from "@/service/roles.service";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AsignarRol = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [busqueda, setBusqueda] = useState("");

	const [rol, setRol] = useState({});
	const [permisos, setPermisos] = useState([]);
	const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

	useEffect(() => {
		const cargarDatos = async () => {
			try {
				const permisosData = await permisoService.listarPermisos();
				const permisosAsignadosData =
					await rolPermisoService.listarPermisosPorRol(id);
				const rolData = await rolService.listarRolesId(id);

				setPermisos(
					Array.isArray(permisosData)
						? permisosData
						: Array.isArray(permisosData.permisos)
							? permisosData.permisos
							: [],
				);

				const permisosAsignados = permisosAsignadosData.data
					.filter(p => p.Estado) 
					.map(p => p.Permiso_Id);
				setPermisosSeleccionados(permisosAsignados);
				setRol(rolData);
			} catch (error) {
				console.error("Error al cargar datos:", error);
			}
		};

		cargarDatos();
	}, [id]);

	const togglePermiso = (permisoId) => {
		setPermisosSeleccionados((prev) =>
			prev.includes(permisoId)
				? prev.filter((id) => id !== permisoId)
				: [...prev, permisoId],
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (permisosSeleccionados.length === 0) {
			showAlert("Advertencia Debe seleccionar al menos un permiso", {
				type: "warning",
			});
			return;
		}

		try {
			const payload = {
				Rol_Id: id,
				Permisos: permisosSeleccionados,
			};

			await rolPermisoService.crearRolPermiso(payload);

			showAlert("¡Éxito! Permisos asignados correctamente", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/roles");
			location.reload()
		} catch (error) {
			console.error("Error al asignar permisos:", error);
			showAlert("Error", "No se pudieron asignar los permisos", "error");
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			type: "warning",
			title: "¿Cancelar?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((result) => {
			if (result.isConfirmed) navigate("/admin/roles");
		});
	};

	const permisosFiltrados = permisos.filter((permiso) =>
		permiso.Nombre.toLowerCase().includes(busqueda.toLowerCase()),
	);

	return (
		<div>
			<div className="w-full  p-8">
				<h1 className="text-4xl font-bold text-gray-800 mb-6">
					Asignar Permisos a Rol:{" "}
					<span className="text-blue-600">
						{rol?.data?.Nombre || "Cargando..."}
					</span>
				</h1>

				<div className="mb-8">
					<input
						type="text"
						placeholder="Buscar permiso..."
						value={busqueda}
						onChange={(e) => setBusqueda(e.target.value)}
						className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-400"
					/>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					<div>
						<h3 className="text-4 font-semibold mb-4">Seleccionar Permisos</h3>
						<div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
							{permisosFiltrados.map((permiso) => (
								<label
									key={permiso.Id}
									className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-300 transition"
								>
									<input
										type="checkbox"
										className="accent-blue-600 w-5 h-5"
										checked={permisosSeleccionados.includes(permiso.Id)}
										onChange={() => togglePermiso(permiso.Id)}
									/>
									<span className="text-gray-800 ">{permiso.Nombre}</span>
								</label>
							))}
						</div>
					</div>

					<div className="md:col-span-2 flex gap-4">
						<Button icon="fa-floppy-o" className="green" type="submit">
							Guardar
						</Button>
						<Button icon="fa-times" className="red" onClick={handleCancel}>
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AsignarRol;
