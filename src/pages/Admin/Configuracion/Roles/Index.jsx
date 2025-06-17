import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { rolService } from "@/service/roles.service";
import { permisoService } from '@/service/permisos.service';
import { rolPermisoService } from '@/service/asignacionPermiso';

export default function Rol() {
	const navigate = useNavigate();
	const title = "Roles";
	const canEdit = (roles) => roles.Estado === true;
	const canDelete = (roles) => roles.Estado === true;

	const columns = [
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Descripcion", accessor: "Descripcion" },
		{ header: "Estado", accessor: "Estado" },
	];

	const [roles, setRoles] = useState([]);

	const obtenerRoles = useCallback(async () => {
		try {
			const response = await rolService.listarRoles();

			const normalizado = response.data.map((rol) => ({
				Id: rol.Id,
				Nombre: rol.Nombre,
				Descripcion: rol.Descripcion,
				Estado: rol.Estado,
			}));

			setRoles(normalizado);
		} catch (error) {
			console.error("Error al obtener los roles:", error);
		}
	}, []);

	const handleToggleEstado = async (id) => {
		try {
			await rolService.cambiarEstadoRoles(id);
			await obtenerRoles();
		} catch (error) {
			console.error("Error cambiando estado:", error);
			alert("Error cambiando estado");
		}
	};

	const handleDelete = async (rol) => {
		const result = await showAlert(
				`¿Estás seguro que quieres eliminar la rol "<strong>${rol.Nombre}</strong>"? Esta acción no se puede deshacer.`,
				{
					type: "warning",
					title: "Confirmar eliminación",
					showConfirmButton: true,
					showCancelButton: true,
					confirmButtonText: "Sí, eliminar",
					cancelButtonText: "Cancelar",
				}
				);

		if (result.isConfirmed) {
			try {
				await rolService.eliminarRoles(rol.Id);
				await showAlert("Rol eliminado correctamente.", {
						type: "success",
						title: "Éxito",
						duration: 2000,
					});
				await obtenerRoles();
			} catch (error) {
				const mensaje =
					error?.response?.data?.message ||
					"No se pudo eliminar el rol.";
				await showAlert(mensaje, {
					type: "error",
					title: "Error",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
				});
			}
		}
	};

	async function verDetalleRol(rol) {
			let relaciones = [];
			try {
				const response = await rolPermisoService.listarPermisosPorRol(rol.Id);
				relaciones = response.data || [];
			} catch (error) {
				console.error("Error al obtener permisos del rol:", error);
			}

			const permisos = [];

			for (const rel of relaciones) {
				try {
				const permisoResp = await permisoService.listarPermisosId(rel.Permiso_Id);
				if (permisoResp?.Nombre) {
					permisos.push(permisoResp.Nombre);
				}
				} catch (err) {
				console.warn(`Permiso con ID ${rel.Permiso_Id} no encontrado`, err);
				}
			}

			const html = `
				<div class="space-y-7 text-gray-100">
				<!-- Encabezado -->
				<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
					<h3 class="text-xl font-bold text-white">Detalles de Rol</h3>
					<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
					ID: ${rol.Id ?? "N/A"}
					</span>
				</div>

				<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
					<!-- Nombre -->
					<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 bg-[#111827] rounded-md z-10">Nombre</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
						<div class="font-medium text-white">${rol.Nombre ?? "-"}</div>
					</div>
					</div>

					<!-- Estado -->
					<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 bg-[#111827] rounded-md z-10">Estado</label>
					<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
						rol.Estado ? 'bg-[#112d25] border-emerald-500/30' : 'bg-[#2c1a1d] border-rose-500/30'
					}">
						<div class="font-medium ${
						rol.Estado ? 'text-emerald-300' : 'text-rose-300'
						}">
						${rol.Estado ? "Activo" : "Inactivo"}
						</div>
					</div>
					</div>

					<!-- Descripción -->
					<div class="relative md:col-span-2">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 bg-[#111827] rounded-md z-10">Descripción</label>
					<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
						<div class="text-gray-200 ${!rol.Descripcion ? 'italic text-gray-400' : ''}">
						${rol.Descripcion || "No hay descripción disponible"}
						</div>
					</div>
					</div>

					<!-- Permisos Relacionados -->
					<div class="relative md:col-span-2">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 bg-[#111827] rounded-md z-10">Permisos Relacionados</label>
					<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] max-h-48 overflow-y-auto">
						<ul class="list-disc pl-5 space-y-1 text-gray-200">
						${
							permisos.length > 0
							? permisos.map(p => `<li>${p}</li>`).join("")
							: `<li class="italic text-gray-400">No hay permisos asignados</li>`
						}
						</ul>
					</div>
					</div>
				</div>
				</div>
			`;

			await showAlert(html, {
				title: 'Ver Detalle de Roles',
				width: '640px',
				background: '#111827',
				color: '#ffffff',
				padding: '1.5rem',
				confirmButtonText: 'Cerrar',
				confirmButtonColor: '#4f46e5',
				customClass: {
				popup: 'rounded-xl shadow-2xl border border-gray-700/50',
				confirmButton: 'px-6 py-2 font-medium rounded-lg mt-4'
				}
			});
			}


	const handleEdit = (rol) => {
		navigate(`/admin/roles/editar/${rol.Id}`);
	};


	const handlePageChange = (event, value) => {
		setCurrentPage(value);
	};

	const handleAsignarPermisos = (rol) => {
		navigate(`/admin/roles/asignar/${rol.Id}`);
	};

	useEffect(() => {
		obtenerRoles();
	}, [obtenerRoles]);

	return (
		<GeneralTable
			title={title}
			columns={columns}
			data={roles}
			onAdd={() => navigate("/admin/roles/agregar")}
			onView={verDetalleRol}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
			onAssignPermissions={handleAsignarPermisos}
		/>
	);
}
