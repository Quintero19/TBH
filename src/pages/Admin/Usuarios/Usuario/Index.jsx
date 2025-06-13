import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "../../../../components/GeneralTable";
import { userService } from "../../../../service/usuario.service";
import { rolService } from "../../../../service/roles.service.js"

export default function Usuario() {
	const navigate = useNavigate();
	const title = "Gestion De Usuarios";
	const [roles, setRoles] = useState([]);
	const canEdit = (usuario) => usuario.Estado === true;
	const canDelete = (usuario) => usuario.Estado === true;

	const columns = [
		{ header: "Documento", accessor: "Documento" },
		{ header: "Correo", accessor: "Correo" },
		{ header: "Estado", accessor: "Estado" },
	];

	useEffect(() => {
		const fetchRoles = async () => {
			try {
			const response = await rolService.listarRoles(); 
			setRoles(response.data); 
			} catch (error) {
			console.error("Error al cargar roles:", error);
			}
		};

		fetchRoles();
		}, []);

	const [usuarios, setUsuarios] = useState([]);

	const obtenerUsuarios = useCallback(async () => {
		try {
			const response = await userService.listarUsuarios();

			const normalizado = response.data.map((usuario) => ({
				Documento: usuario.Documento,
				Correo: usuario.Correo,
				Estado: usuario.Estado,
				Id_Usuario: usuario.Id_Usuario,
				Rol_Id: usuario.Rol_Id,
			}));

			setUsuarios(normalizado);
		} catch (error) {
			console.error("Error al obtener los usuarios:", error);
		}
	}, []);


	const handleToggleEstado = async (id) => {
		try {
			await userService.actualizarEstadoUsuario(id);
			await obtenerUsuarios();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			alert("Error cambiando estado");
		}
	};

	const handleDelete = async (usuario) => {
		const result = await showAlert(`¿Deseas eliminar al usuario con documento "${usuario.Documento}"?`,{
			type: "warning",
			title: "Confirmar eliminación",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		});

		if (result.isConfirmed) {
			try {
				await userService.eliminarUsuario(usuario.Id_Usuario);
				await showAlert("Usuario eliminado correctamente",{
					type: "success",
					title: "Éxito",
					duration: 2000,
				});
				await obtenerUsuarios();
			} catch (error) {
				const mensaje =
					error?.response?.data?.message ||
					"No se pudo eliminar el Usuario.";
				await showAlert(mensaje, {
					type: "error",
					title: "Error",
					showConfirmButton: true,
					confirmButtonText: "Cerrar",
				});
			}
		}
	};

	const handleVerDetalles = async (usuario) => {
		const rolNombre = roles.find((r) => r.Id === usuario.Rol_Id)?.Nombre || "Desconocido";
		try {
			const html = `
			<div class="space-y-7 text-gray-100">
				<!-- Encabezado -->
				<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
				<h3 class="text-xl font-bold text-white">Detalles de Usuario</h3>
				<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
					ID: ${usuario.Id_Usuario ?? "N/A"}
				</span>
				</div>
	
				<!-- Campos -->
				<div class="grid grid-cols-1 gap-7 md:grid-cols-2">
				<!-- Nombre -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
					Documento
					</label>
					<div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
					<div class="font-medium text-white">${usuario.Documento ?? "-"}</div>
					</div>
				</div>
				<!-- Estado -->
				<div class="relative">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
					Estado
					</label>
					<div class="rounded-lg border pt-4 pb-2.5 px-4 ${
					usuario.Estado
						? 'bg-[#112d25] border-emerald-500/30'
						: 'bg-[#2c1a1d] border-rose-500/30'
					}">
					<div class="font-medium ${
						usuario.Estado ? 'text-emerald-300' : 'text-rose-300'
					}">
						${usuario.Estado ? "Activo" : "Inactivo"}
					</div>
					</div>
				</div>
	
				<!-- Descripción -->
				<div class="relative md:col-span-2">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
					Rol
					</label>
					<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
					<div class="text-gray-200 ${!rolNombre ? 'italic text-gray-400' : ''}">
						${rolNombre|| "No hay descripción disponible"}
					</div>
					</div>
				</div>
				<div class="relative md:col-span-2">
					<label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
					Correo
					</label>
					<div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
					<div class="text-gray-200 ${!usuario.Correo ? 'italic text-gray-400' : ''}">
						${usuario.Correo || "No hay descripción disponible"}
					</div>
					</div>
				</div>
				</div>
			</div>
			`;
	
			await showAlert(html, {
			title: '',
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
	
		} catch (error) {
			console.error(error);
			await showAlert(`Error: ${error.message || error}`, {
			title: 'Error',
			icon: 'error',
			background: '#1f2937',
			color: '#ffffff',
			width: '500px',
			confirmButtonColor: '#dc2626'
			});
		}
		};


	const handleEdit = (usuario) => {
		navigate(`/admin/usuario/editar/${usuario.Id_Usuario}`);
	};

	useEffect(() => {
		obtenerUsuarios();
	}, [obtenerUsuarios]);

	return (
		<GeneralTable
			title="Gestion De Usuarios"
			columns={columns}
			data={usuarios}
			onAdd={() => navigate("/admin/usuario/agregar")}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Usuario"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
		/>
	);
}
