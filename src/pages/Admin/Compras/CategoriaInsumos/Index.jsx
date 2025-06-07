import React, { useCallback, useEffect, useState } from "react";
import GeneralTable from "@/components/GeneralTable";
import api from "@/utils/api";
import { showAlert } from "@/components/AlertProvider";

const CategoriaInsumoAdmin = () => {
	/** ─────────────────────────────
	 * Estados principales
	 * ───────────────────────────── */
	const [categorias, setCategorias] = useState([]);
	const [error, setError] = useState(null);

	/** ─────────────────────────────
	 * Cargar categorías desde la API
	 * ───────────────────────────── */
	const cargarCategorias = useCallback(async () => {
		try {
			setError(null);
			const { data } = await api.get("/categoria-insumo");
			setCategorias(data.data);
		} catch (err) {
			console.error(err);
			setError("Error al cargar categorías.");
		}
	}, []);

	useEffect(() => {
		cargarCategorias();
	}, [cargarCategorias]);

	/** ─────────────────────────────
	 * Cambiar estado ON/OFF
	 * ───────────────────────────── */
	const toggleEstado = async (categoriaId) => {
		const categoria = categorias.find(
			(c) => c.Id_Categoria_Insumos === categoriaId,
		);
		if (!categoria) return;

		try {
			await api.patch(`/categoria-insumo/estado/${categoriaId}`, {
				estado: !categoria.Estado,
			});
			await cargarCategorias();
		} catch (err) {
			console.error(err);
			alert("Error al cambiar el estado.");
		}
	};

	/** ─────────────────────────────
	 * Columnas de la tabla
	 * ───────────────────────────── */
	const columns = [
		{ header: "ID", accessor: "Id_Categoria_Insumos" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Descripción", accessor: "Descripcion" },
		{ header: "Estado", accessor: "Estado" },
	];

	/** ─────────────────────────────
	 * Acciones CRUD
	 * ───────────────────────────── */

	const handleVerDetalles = async (categoria) => {
	try {
		const html = `
			<div class="text-left">
				<p><strong>ID:</strong> ${categoria.Id_Categoria_Insumos || "-"}</p>
				<p><strong>Nombre:</strong> ${categoria.Nombre || "-"}</p>
				<p><strong>Descripción:</strong> ${categoria.Descripcion || "-"}</p>
				<p><strong>Estado:</strong> ${categoria.Estado ? "Activo" : "Inactivo"}</p>
			</div>
		`;

		await showAlert(html, {
			type: "info",
			title: `Detalles Categoría ID: ${categoria.Id_Categoria_Insumos}`,
			showConfirmButton: true,
			swalOptions: {
				confirmButtonText: "Cerrar",
				padding: "1rem",
			}
		});
	} catch (error) {
		console.error(error);
		showAlert(`No se pudieron cargar los detalles: ${error}`, {
			type: "error",
			title: "Error",
		});
	}
};

	const handleAdd = () => console.log("Agregar categoría");
	const handleEdit = (row) => console.log("Editar categoría:", row);
	const handleDelete = (row) => console.log("Eliminar categoría:", row);

	/** ─────────────────────────────
	 * Render del componente
	 * ───────────────────────────── */
	return (
		<>
			{error && (
				<div className="text-red-600 font-semibold mb-4">
					{error}
				</div>
			)}
			<GeneralTable
				title="Listado de Categorías"
				columns={columns}
				data={categorias}
				onView={handleVerDetalles}
				onToggleEstado={toggleEstado}
				onAdd={handleAdd}
				onEdit={handleEdit}
				onDelete={handleDelete}
				idAccessor="Id_Categoria_Insumos"
			/>
		</>
	);
};

export default CategoriaInsumoAdmin;
