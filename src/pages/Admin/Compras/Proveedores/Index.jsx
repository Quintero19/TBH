import { React, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GeneralTable from "@/components/GeneralTable";
import { proveedorService } from "@/service/proveedores.service";
import { showAlert } from "@/components/AlertProvider";

const Proveedores = () => {

	const [proveedores, setProveedores] = useState([]);
	const navigate = useNavigate();
	const canEdit = (proveedor) => proveedor.Estado === true;
	const canDelete = (proveedor) => proveedor.Estado === true;

	const columns = [
		{ header: "ID", accessor: "Id_Proveedores" },
		{ header: "Tipo Proveedor", accessor: "Tipo_Proveedor" },
		{ header: "Nombre / Empresa", accessor: "nombre" },
		{ header: "Celular / Celular Empresa", accessor: "celular" },
		{ header: "Email", accessor: "Email" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ─────── Cargar Proveedores ──────── */

	const fetchProveedores = useCallback(async () => {
		try {
			const response = await proveedorService.obtenerProveedores();
			setProveedores(transformData(response.data));
		} catch (error) {
			console.error(
				"Error al obtener proveedores:",
				error.response?.data || error,
			);
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
					nombre: isEmpresa ? item.Nombre_Empresa : item.Nombre,
					celular: isEmpresa ? item.Celular_Empresa : item.Celular,
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
			})
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
				<div class="text-left">
					<p><strong>Tipo de Proveedor:</strong> ${proveedor.Tipo_Proveedor || "-"}</p>
					${
						proveedor.Tipo_Proveedor !== "Natural"
							? `
								<p><strong>NIT:</strong> ${proveedor.NIT}</p>
								<p><strong>Nombre de la Empresa:</strong> ${proveedor.Nombre_Empresa || "-"}</p>
								<p><strong>Celular de la Empresa:</strong> ${proveedor.Celular_Empresa || "-"}</p>
								<p><strong>Nombre Asesor:</strong> ${proveedor.Asesor || "-"}</p>
								<p><strong>Celular del Asesor:</strong> ${proveedor.Celular_Asesor || "-"}</p>
							`
							: `
								<p><strong>Tipo de Documento:</strong> ${proveedor.Tipo_Documento || "-"}</p> 
								<p><strong>Documento:</strong> ${proveedor.Documento || "-"}</p> 
								<p><strong>Nombre:</strong> ${proveedor.Nombre || "-"}</p>
								<p><strong>Celular:</strong> ${proveedor.Celular || "-"}</p>
							`
					}
					<p><strong>Correo:</strong> ${proveedor.Email || "-"}</p>
					<p><strong>Dirección:</strong> ${proveedor.Direccion || "-"}</p>
					<p><strong>Estado:</strong> ${proveedor.Estado ? "Activo" : "Inactivo"}</p>
				</div>
			`;

			await showAlert(html, {
				type: "info",
				title: `Detalles Proveedor ID: ${proveedor.Id_Proveedores}`,
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				}
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
			`¿Deseas eliminar al proveedor <strong>${proveedor.nombre}</strong>?`,
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
				await proveedorService.eliminarProveedor(proveedor.Id_Proveedores);

				await window.showAlert("Proveedor eliminado correctamente", {
					type: "success",
					title: "Eliminado",
					duration: 2000,
				});

				fetchProveedores();
			} catch (error) {
				console.error("Error Eliminando Proveedor:", error);
				const mensaje = error.response?.data?.message || "Error al eliminar el proveedor";

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