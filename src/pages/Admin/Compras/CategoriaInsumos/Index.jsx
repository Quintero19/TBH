import { useCallback, useEffect, useState } from "react";
import GeneralTable from "../../../../components/GeneralTable";
import api from "../../../../utils/api";

const CategoriaInsumoAdmin = () => {
	const [categorias, setCategorias] = useState([]);
	const [nombre, setNombre] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [estado, setEstado] = useState(true);
	const [error, setError] = useState(null);
	const [editando, setEditando] = useState(null);
	const [cargando, setCargando] = useState(false);

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

	const crearCategoria = async () => {
		if (!nombre.trim()) return alert("El nombre es obligatorio.");
		try {
			setCargando(true);
			await api.post("/categoria-insumo", {
				Nombre: nombre,
				Descripcion: descripcion,
				Estado: estado,
			});
			limpiarFormulario();
			await cargarCategorias();
		} catch (err) {
			console.error(err);
			alert("Error al crear la categoría.");
		} finally {
			setCargando(false);
		}
	};

	const actualizarCategoria = async () => {
		if (!nombre.trim()) return alert("El nombre es obligatorio.");
		try {
			setCargando(true);
			await api.put(`/categoria-insumo/${editando}`, {
				Nombre: nombre,
				Descripcion: descripcion,
				Estado: estado,
			});
			limpiarFormulario();
			await cargarCategorias();
		} catch (err) {
			console.error(err);
			alert("Error al actualizar la categoría.");
		} finally {
			setCargando(false);
		}
	};

	const eliminarCategoria = async (id) => {
		if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
		try {
			setCargando(true);
			await api.delete(`/categoria-insumo/${id}`);
			await cargarCategorias();
		} catch (err) {
			console.error(err);
			alert("Error al eliminar la categoría.");
		} finally {
			setCargando(false);
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
