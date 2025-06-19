import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { compraService } from "@/service/compras.service";
import { proveedorService } from "@/service/proveedores.service";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Compras = () => {
	const [proveedores, setProveedores] = useState([]);
	const [compras, setCompras] = useState([]);
	const navigate = useNavigate();

	const columns = [
		{ header: "ID", accessor: "Id_Compras" },
		{ header: "Proveedor", accessor: "NombreProveedor" },
		{ header: "Fecha", accessor: "Fecha" },
		{ header: "Total", accessor: "Total" },
		{ header: "Estado", accessor: "Estado" },
	];

	/* ────────── Cargar Compras ────────── */

	const fetchCompras = useCallback(async (proveedoresData) => {
		try {
			const response = await compraService.obtenerCompras();
			setCompras(transformData(response.data, proveedoresData));
		}catch (error) {
			const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
				showAlert(`Error: ${mensaje || error}`, {
					title: "Error",
					icon: "error",})
				}
	}, []);

	useEffect(() => {
		const fetchProveedores = async () => {
			try {
				const response = await proveedorService.obtenerProveedores();
				setProveedores(response.data);
				await fetchCompras(response.data);
			} catch (error) {
				console.error(
					"Error al obtener proveedores:",
					error.response?.data || error,
				);
			}
		};
		fetchProveedores();
	}, [fetchCompras]);

	/* ─────────────────────────────────── */

	/* ───── Transformación de Datos ───── */

	const transformData = useCallback(
		(lista, listaproveedores) =>
			lista.map((item) => {
				const proveedor = listaproveedores.find(
					(p) => p.Id_Proveedores === item.Id_Proveedores,
				);
				const isEmpresa = proveedor.Tipo_Proveedor === "Empresa";
				return {
					...item,
					NombreProveedor: isEmpresa
						? proveedor.Nombre_Empresa
						: proveedor.Nombre,
					Total: item.Total != null ? Math.floor(item.Total) : "-",
				};
			}),
		[],
	);

	/* ─────────────────────────────────── */

	/* ───────── Cambiar Estado ────────── */

	const handleToggleEstado = async (id) => {
		const result = await window.showAlert("¿Deseas anular esta Compra?", {
			type: "warning",
			title: "¿Estás seguro?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		});
		if (result.isConfirmed) {
			try {
				await compraService.cambiarEstadoCompra(id);
				await fetchCompras(proveedores);
			} catch (error) {
				console.error("Error Anulando Compra:", error);
				const mensaje =
					error.response?.data?.message || "Error al anular la compra";

				window.showAlert(mensaje, {
					type: "error",
					title: "Error",
					duration: 2500,
				});
			}
		}
	};

	/* ─────────────────────────────────── */

	/* ────────── Ir a Agregar ─────────── */

	const handleAdd = () => {
		navigate("/admin/compras/agregar");
	};

	/* ──────────────────────────────────── */

	/* ────────── Ver Detalles ──────────── */

	const handleVerDetalles = async (talla) => {
		try {
			const html = `
							<div class="text-left">
								<p><strong>Categoria Producto:</strong> ${talla.NombreCategoria || "-"}</p>
								<p><strong>Nombre:</strong> ${talla.Nombre || "-"}</p>
								<p><strong>Estado:</strong> ${talla.Estado ? "Activo" : "Inactivo"}</p>
							</div>
			`;
			await showAlert(html, {
				title: `Detalles Talla ID: ${talla.Id_Tallas}`,
				type: "info",
				showConfirmButton: true,
				swalOptions: {
					confirmButtonText: "Cerrar",
					padding: "1rem",
				},
			});
		} catch (error) {
			console.error("Error al obtener la talla:", error);
			showAlert(`No se pudieron cargar los detalles de la talla:${error}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ──────────────────────────────────── */

	return (
		<GeneralTable
			title="Compras"
			columns={columns}
			data={compras}
			onAdd={handleAdd}
			onView={handleVerDetalles}
			onCancel={handleToggleEstado}
			idAccessor="Id_Compras"
			stateAccessor="Estado"
		/>
	);
};

export default Compras;
