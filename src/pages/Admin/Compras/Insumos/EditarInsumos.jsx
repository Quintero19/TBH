import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { insumoService } from "@/service/insumo.service";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarInsumo = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	const [formData, setFormData] = useState({
		Nombre: "",
		Id_Categoria_Insumos: "",
		Stock: 0,
		Estado: true,
	});

	const [categorias, setCategorias] = useState([]);
	const [insumosExistentes, setInsumosExistentes] = useState([]);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(true);

	const validateField = (name, value, currentErrors = {}) => {
		const newErrors = { ...currentErrors };
		const val = value?.toString().trim();

		switch (name) {
			case "Nombre":
				if (!val) newErrors.Nombre = "El nombre es obligatorio";
				else if (val.length < 3) newErrors.Nombre = "Mínimo 3 caracteres";
				else if (!/^[a-zA-Z0-9]+$/.test(val))
					newErrors.Nombre = "Solo letras y números, sin espacios";
				else newErrors.Nombre = undefined;
				break;

			case "Id_Categoria_Insumos":
				if (!val) newErrors.Id_Categoria_Insumos = "Seleccione una categoría";
				else newErrors.Id_Categoria_Insumos = undefined;
				break;

			default:
				break;
		}

		return newErrors;
	};

	useEffect(() => {
		const cargarDatos = async () => {
			try {
				const [insumoRes, categoriasRes, insumosTodos] = await Promise.all([
					insumoService.obtenerInsumoPorId(id),
					categoriaInsumoService.obtenerCategorias(),
					insumoService.obtenerInsumos(),
				]);

				const data = insumoRes.data;
				setCategorias(categoriasRes.data || []);
				setInsumosExistentes(insumosTodos.data || []);

				setFormData({
					Nombre: data.Nombre || "",
					Id_Categoria_Insumos: data.Id_Categoria_Insumos || "",
					Stock: data.Stock ?? 0,
					Estado: data.Estado !== undefined ? data.Estado : true,
				});
			} catch (err) {
				console.error(err);
				showAlert("No se pudo cargar el insumo", {
					type: "error",
					title: "Error",
				});
				navigate("/admin/insumo");
			} finally {
				setLoading(false);
			}
		};

		cargarDatos();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : value;

		setFormData((prev) => ({ ...prev, [name]: val }));
		setErrors((prevErrors) => validateField(name, val, prevErrors));
	};

	/* ---------- Validación al perder foco (onBlur) ---------- */
	const handleBlur = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : value;
		// Validación adicional al perder foco
		setErrors((prevErrors) => validateField(name, val, prevErrors));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		let newErrors = validateField("Nombre", formData.Nombre, {});
		newErrors = validateField(
			"Id_Categoria_Insumos",
			formData.Id_Categoria_Insumos,
			newErrors,
		);

		setErrors(newErrors);

		if (Object.values(newErrors).some((err) => err)) {
			showAlert("Corrige los errores antes de guardar", {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		const duplicado = insumosExistentes.find(
			(i) =>
				i.Nombre.trim().toLowerCase() ===
					formData.Nombre.trim().toLowerCase() &&
				i.Id_Insumos.toString() !== id,
		);

		if (duplicado) {
			showAlert("Ya existe otro insumo con ese nombre", {
				type: "warning",
				title: "Insumo duplicado",
				duration: 2000,
			});
			return;
		}

		try {
			await insumoService.actualizarInsumo(id, formData);
			await showAlert("Insumo actualizado correctamente", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/insumo");
		} catch (err) {
			console.error(err);
			const mensaje = err.response?.data?.message || "Error al guardar";
			showAlert(mensaje, {
				type: "error",
				title: "Error",
			});
		}
	};

	const handleCancel = () => {
		showAlert("¿Estás seguro de cancelar los cambios?", {
			type: "warning",
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((r) => r.isConfirmed && navigate("/admin/insumo"));
	};

	if (loading) {
		return (
			<p className="text-center text-gray-500 text-xl py-20">
				Cargando datos del insumo...
			</p>
		);
	}

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Insumo
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
				noValidate
			>
				{/* Campo: Nombre */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg min-h-[120px]">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						onBlur={handleBlur}
						className={`w-full border p-2 rounded ${errors.Nombre ? "border-red-500" : "border-gray-300"}`}
						placeholder="Ingrese el nombre del insumo"
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				{/* Campo: Categoría */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg">
					<h3 className="text-2xl text-black font-bold mb-2">
						Categoría <span className="text-red-500">*</span>
					</h3>
					<select
						name="Id_Categoria_Insumos"
						value={formData.Id_Categoria_Insumos}
						onChange={handleChange}
						onBlur={handleBlur}
						className={`w-full border p-2 rounded ${errors.Id_Categoria_Insumos ? "border-red-500" : "border-gray-300"}`}
					>
						<option value="">Seleccione una categoría</option>
						{categorias.map((cat) => (
							<option
								key={cat.Id_Categoria_Insumos}
								value={cat.Id_Categoria_Insumos}
							>
								{cat.Nombre}
							</option>
						))}
					</select>
					{errors.Id_Categoria_Insumos && (
						<p className="text-red-500 text-sm mt-1">
							{errors.Id_Categoria_Insumos}
						</p>
					)}
				</div>

				{/* Campo oculto: Stock */}
				<input type="hidden" name="Stock" value={formData.Stock} />

				{/* Campo oculto: Estado */}
				<input
					type="checkbox"
					name="Estado"
					checked={formData.Estado}
					disabled
					className="hidden"
				/>

				{/* Botones */}
				<div className="md:col-span-2 flex gap-4">
					<Button 
						icon="fa fa-save" 
						className="green" 
						type="submit"
						disabled={Object.keys(errors).some(key => errors[key] !== undefined)}
					>
						Guardar Cambios
					</Button>
					<Button icon="fa fa-times" className="red" onClick={handleCancel}>
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};

export default EditarInsumo;
