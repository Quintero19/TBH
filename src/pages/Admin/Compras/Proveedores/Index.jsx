import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { proveedorService } from "@/service/proveedores.service";
import { React, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Proveedores = () => {
	const [proveedores, setProveedores] = useState([]);
	const navigate = useNavigate();
	const canEdit = (proveedor) => proveedor.Estado === true;
	const canDelete = (proveedor) => proveedor.Estado === true;

	const columns = [
		{ header: "ID", accessor: "Id_Proveedores" },
		{ header: "Tipo Proveedor", accessor: "Tipo_Proveedor" },
		{ header: "Nombre / Empresa", accessor: "Nombre" },
		{ header: "Celular / Celular Empresa", accessor: "Celular" },
		{ header: "Email", accessor: "Email" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ─────── Cargar Proveedores ──────── */

	const fetchProveedores = useCallback(async () => {
		try {
			const response = await proveedorService.obtenerProveedores();
			setProveedores(transformData(response.data));
			console.log(response)
		} catch (error) {
					const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
						showAlert(`Error: ${mensaje || error}`, {
							title: "Error",
							icon: "error",})
					}
	}, []);

	useEffect(() => {
		fetchProveedores();
	}, [fetchProveedores]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(data) =>
			data.map((item) => {
				const isEmpresa = item.Tipo_Proveedor === "Empresa";
				return {
					...item,
					Nombre: isEmpresa ? item.Nombre_Empresa : item.Nombre,
					Celular: isEmpresa ? item.Celular_Empresa : item.Celular,
				};
			}),
		[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		try {
			await proveedorService.actualizarEstadoProveedor(id);
			await fetchProveedores();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);

			showAlert(`Error Cambiando Estado del proveedor: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/proveedores/agregar");
	};

	/* ──────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (proveedor) => {
		try {
			
			const html = `
				<div class="space-y-6 text-gray-100">
					<div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-4">
						<h3 class="text-xl font-bold text-white">Detalles del Proveedor</h3>
						<span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
							ID: ${proveedor.Id_Proveedores ?? "N/A"}
						</span>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="relative col-span-2">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Nombre</label>
							<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
								${proveedor.Nombre}
							</div>
						</div>

						${proveedor.Tipo_Proveedor === "Empresa" ? `
							<div class="relative col-span-2">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">NIT</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${proveedor.NIT}
								</div>
							</div>
						` : `							
							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Tipo de Documento</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${proveedor.Tipo_Documento || "-"}
								</div>
							</div>

							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Documento</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${proveedor.Documento || "-"}
								</div>
							</div>
						`}

						<div class="relative">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">
								Tipo de Proveedor
							</label>
							<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
								${proveedor.Tipo_Proveedor}
							</div>
						</div>

						<div class="relative">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">
								Celular
							</label>
							<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
								${proveedor.Celular}
							</div>
						</div>

						${proveedor.Tipo_Proveedor === "Empresa" ? `
							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">
									Asesor
								</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${proveedor.Asesor || "-"}
								</div>
							</div>	

							<div class="relative">
								<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">
									Celular Asesor
								</label>
								<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
									${proveedor.Celular_Asesor || "-"}
								</div>
							</div>
						` : ``}

						<div class="relative">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">
								Dirección
							</label>
							<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
								${proveedor.Direccion || "-"}
							</div>
						</div>

						<div class="relative">
							<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Estado</label>
							<div class="rounded-lg px-4 pt-4 pb-2.5 font-medium border ${proveedor.Estado ? "bg-[#112d25] border-emerald-500/30 text-emerald-300" : "bg-[#2c1a1d] border-rose-500/30 text-rose-300"}">
								${proveedor.Estado ? "Activo" : "Inactivo"}
							</div>
						</div>


					<div class="relative col-span-2">
						<label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Correo</label>
						<div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
							${proveedor.Email}
						</div>
					</div>

				</div>
			`;

			await showAlert(html, {
				type: "info",
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			showAlert(`No se pudieron cargar los detalles del proveedor: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ──────────── Ir a Editar ─────────── */

	const handleEdit = (proveedor) => {
		navigate(`/admin/proveedores/editar/${proveedor.Id_Proveedores}`);
	};

	/* ───────────────────────────────────── */

	/* ───────────── Eliminar ───────────────*/

	const handleDelete = async (proveedor) => {
		const result = await window.showAlert(
			`¿Deseas eliminar al proveedor <strong>${proveedor.Nombre}</strong>?`,
			{
				type: "warning",
				title: "¿Estás seguro?",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: "Sí, eliminar",
				cancelButtonText: "Cancelar",
			},
		);

		if (result.isConfirmed) {
			try {
				await proveedorService.eliminarProveedor(proveedor.Id_Proveedores);

				await window.showAlert("Proveedor eliminado correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchProveedores();
			} catch (error) {
				console.error("Error Eliminando Proveedor:", error);
				const mensaje =
					error.response?.data?.message || "Error al eliminar el proveedor";

				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};

	/* ───────────────────────────────────── */

	return (
		<GeneralTable
			title="Proveedores"
			columns={columns}
			data={proveedores}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onToggleEstado={handleToggleEstado}
			idAccessor="Id_Proveedores"
			stateAccessor="Estado"
			canEdit={canEdit}
			canDelete={canDelete}
		/>
	);
};

export default Proveedores;
