import { React, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GeneralTable from "@/components/GeneralTable";
import { proveedorService } from "@/service/proveedores.service";

const Proveedores = () => {
	/* --------------------- State --------------------- */
	const [proveedores, setProveedores] = useState([]);
	const [searchTerm, setSearchTerm] = useState(""); // ← si usas búsqueda
	const navigate = useNavigate();

	/* ------------------ Permisos --------------------- */
	const canEdit   = (prov) => prov.Estado === true;
	const canDelete = (prov) => prov.Estado === true;

	/* ----------------- Columnas ---------------------- */
	const columns = [
		{ header: "ID", accessor: "Id_Proveedores" },
		{ header: "Tipo Proveedor", accessor: "Tipo_Proveedor" },
		{ header: "Nombre / Empresa", accessor: "nombre" },
		{ header: "Celular / Celular Empresa", accessor: "celular" },
		{ header: "Email", accessor: "Email" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* -------- Transformación de datos --------------- */
	const transformData = useCallback((data) =>
		data.map((item) => {
			const isEmpresa = item.Tipo_Proveedor === "Empresa";
			return {
				...item,
				nombre:  isEmpresa ? item.Nombre_Empresa  : item.Nombre,
				celular: isEmpresa ? item.Celular_Empresa : item.Celular,
			};
		}),
	[],);

	/* ----------- Obtener proveedores ---------------- */
	const fetchProveedores = useCallback(async () => {
		try {
			const res = await proveedorService.obtenerProveedores();
			setProveedores(transformData(res.data));
		} catch (error) {
			console.error("Error al obtener proveedores:", error.response?.data || error);
		}
	}, [transformData]);

	useEffect(() => {
		fetchProveedores();
	}, [fetchProveedores]);

	/* ------------ Cambiar estado -------------------- */
	const handleToggleEstado = async (id) => {
		try {
			await proveedorService.actualizarEstadoProveedor(id);
			await fetchProveedores();
		} catch (error) {
			console.error("Error cambiando estado:", error.response?.data || error);
			window.showAlert(`Error cambiando estado del proveedor: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ----------------- Agregar ----------------------- */
	const handleAdd = () => navigate("/admin/proveedores/agregar");

	/* --------------- Ver detalles -------------------- */
	const handleVerDetalles = async (prov) => {
		try {
			const html = `
				<div class="text-left">
					<p><strong>Tipo de Proveedor:</strong> ${prov.Tipo_Proveedor || "-"}</p>
					${
						prov.Tipo_Proveedor !== "Natural"
							? `
								<p><strong>NIT:</strong> ${prov.NIT}</p>
								<p><strong>Nombre de la Empresa:</strong> ${prov.Nombre_Empresa || "-"}</p>
								<p><strong>Celular de la Empresa:</strong> ${prov.Celular_Empresa || "-"}</p>
								<p><strong>Nombre Asesor:</strong> ${prov.Asesor || "-"}</p>
								<p><strong>Celular del Asesor:</strong> ${prov.Celular_Asesor || "-"}</p>
							`
							: `
								<p><strong>Tipo de Documento:</strong> ${prov.Tipo_Documento || "-"}</p> 
								<p><strong>Documento:</strong> ${prov.Documento || "-"}</p> 
								<p><strong>Nombre:</strong> ${prov.Nombre || "-"}</p>
								<p><strong>Celular:</strong> ${prov.Celular || "-"}</p>
							`
					}
					<p><strong>Correo:</strong> ${prov.Email || "-"}</p>
					<p><strong>Dirección:</strong> ${prov.Direccion || "-"}</p>
					<p><strong>Estado:</strong> ${prov.Estado ? "Activo" : "Inactivo"}</p>
				</div>
			`;

			await window.showAlert(html, {
				type: "info",
				title: `Detalles Proveedor ID: ${prov.Id_Proveedores}`,
				showConfirmButton: true,
				swalOptions: { confirmButtonText: "Cerrar", padding: "1rem" },
			});
		} catch (error) {
			window.showAlert(`No se pudieron cargar los detalles: ${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ----------------- Editar ------------------------ */
	const handleEdit = (prov) => {
		navigate(`/admin/proveedores/editar/${prov.Id_Proveedores}`);
	};

	/* ---------------- Eliminar ----------------------- */
	const handleDelete = async (prov) => {
		const result = await window.showAlert(
			`¿Deseas eliminar al proveedor <strong>${prov.nombre}</strong>?`,
			{
				type: "warning",
				title: "¿Estás seguro?",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: "Sí, eliminar",
				cancelButtonText: "Cancelar",
			},
		);

		if (!result.isConfirmed) return;

		try {
			await proveedorService.eliminarProveedor(prov.Id_Proveedores);

			await window.showAlert("Proveedor eliminado correctamente", {
				type: "success",
				title: "Eliminado",
				duration: 2000,
			});

			fetchProveedores();
		} catch (error) {
			const msg = error.response?.data?.message || "Error al eliminar el proveedor";
			window.showAlert(msg, { type: "error", title: "Error", duration: 2500 });
		}
	};

	/* -------------------- Render --------------------- */
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
			/* props de búsqueda/paginación opcionales */
			searchTerm={searchTerm}
			onSearchChange={(e) => setSearchTerm(e.target.value)}
			currentPage={1}
			totalPages={1}
			onPageChange={() => {}}
		/>
	);
};

export default Proveedores;
