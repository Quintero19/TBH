import { React, useCallback, useEffect, useState } from "react";
import GeneralTable from "../../../../components/GeneralTable";
import api from "../../../../utils/api";

const CategoriaInsumoAdmin = () => {
	const [categorias, setCategorias] = useState([]);
	const [nombre, setNombre] = useState(""); // eslint-disable-line no-unused-vars
	const [descripcion, setDescripcion] = useState(""); // eslint-disable-line no-unused-vars
	const [estado, setEstado] = useState(true); // eslint-disable-line no-unused-vars
	const [error, setError] = useState(null); // eslint-disable-line no-unused-vars
	const [editando, setEditando] = useState(null); // eslint-disable-line no-unused-vars
	const [cargando, setCargando] = useState(false); // eslint-disable-line no-unused-vars

	const cargarCategorias = useCallback(async () => {
		try {
			setCargando(true);
			setError(null);
			const res = await api.get("/categoria-insumo");
			setCategorias(res.data.data);
		} catch (err) {
			console.error(err);
			setError("Error al cargar categorías.");
		} finally {
			setCargando(false);
		}
	}, []);

	const toggleEstado = async (categoria) => {
		try {
			await api.patch(
				`/categoria-insumo/estado/${categoria.Id_Categoria_Insumos}`,
				{
					estado: !categoria.Estado,
				},
			);
			await cargarCategorias();
		} catch (err) {
			console.error(err);
			alert("Error al cambiar el estado.");
		}
	};

	const columns = [
		{ header: "ID", accessor: "Id_Categoria_Insumos" },
		{ header: "Nombre", accessor: "Nombre" },
		{ header: "Descripción", accessor: "Descripcion" },
		{ header: "Estado", accessor: "Estado" },
	];

	useEffect(() => {
		cargarCategorias();
	}, [cargarCategorias]);

	const handleAdd = () => {
		console.log("Agregar proveedor");
	};

	const handleEdit = (row) => {
		console.log("Editar proveedor:", row);
	};

	const handleDelete = (row) => {
		console.log("Eliminar proveedor:", row);
	};

	return (
		<>
			<GeneralTable
				title="Listado de Categorías"
				columns={columns}
				data={categorias}
				onView={(row) =>
					alert(
						`Ver categoría:\nID: ${row.Id_Categoria_Insumos}\nNombre: ${row.Nombre}`,
					)
				}
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
