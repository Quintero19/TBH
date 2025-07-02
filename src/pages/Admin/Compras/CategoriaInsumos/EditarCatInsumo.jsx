import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarCatInsumo = () => {
	const navigate = useNavigate();
	const { id } = useParams();

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true,
	});
	const [categoriaOriginal, setCategoriaOriginal] = useState(null);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(true);

	const validateField = (name, value, currentErrors = {}) => {
		const newErrors = { ...currentErrors };
		const val = value.toString().trim();

		switch (name) {
			case "Nombre":
				if (!val) newErrors.Nombre = "El nombre es obligatorio";
				else if (val.length < 3) newErrors.Nombre = "Mínimo 3 letras";
				else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(val))
					newErrors.Nombre = "Solo caracteres alfabéticos permitidos";
				else newErrors.Nombre = undefined;
				break;

			case "Descripcion":
				if (!val) newErrors.Descripcion = "La descripción es obligatoria";
				else if (val.length < 5) newErrors.Descripcion = "Mínimo 5 caracteres";
				else if (val.length > 100) newErrors.Descripcion = "Máximo 100 caracteres";
				else newErrors.Descripcion = undefined;
				break;

			default:
				break;
		}

		return newErrors;
	};

	useEffect(() => {
		const cargarCategoria = async () => {
			try {
				const response = await categoriaInsumoService.obtenerCategoriaPorId(id);
				const data = response.data;

				const nuevaCategoria = {
					Nombre: data.Nombre || "",
					Descripcion: data.Descripcion || "",
					Estado: data.Estado !== undefined ? data.Estado : true,
				};

				setFormData(nuevaCategoria);
				setCategoriaOriginal(nuevaCategoria);
				setLoading(false);
			} catch (err) {
				console.error(err);
				showAlert("No se pudo cargar la categoría", {
					type: "error",
					title: "Error",
				});
				navigate("/admin/categoriainsumo");
			}
		};

		cargarCategoria();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : value;

		setFormData((prev) => ({ ...prev, [name]: val }));
		setErrors((prevErrors) => validateField(name, val, prevErrors));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validación local
		let newErrors = validateField("Nombre", formData.Nombre, {});
		newErrors = validateField("Descripcion", formData.Descripcion, newErrors);
		setErrors(newErrors);

		if (Object.values(newErrors).some((error) => error !== undefined)) {
			showAlert("Corrige los errores antes de guardar", {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (!categoriaOriginal) {
			showAlert("Datos originales no cargados aún", {
				type: "warning",
				title: "Espera",
			});
			return;
		}

		const sinCambios =
			formData.Nombre.trim() === categoriaOriginal.Nombre.trim() &&
			formData.Descripcion.trim() === (categoriaOriginal.Descripcion || "").trim() &&
			formData.Estado === categoriaOriginal.Estado;

		if (sinCambios) {
			showAlert("No se detectaron cambios para actualizar", {
				type: "info",
				title: "Sin cambios",
				duration: 2000,
			});
			navigate("/admin/categoriainsumo");
			return;
		}

		try {
			await categoriaInsumoService.actualizarCategoria(id, formData);
			await showAlert("Categoría actualizada correctamente", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/categoriainsumo");
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
		}).then((r) => r.isConfirmed && navigate("/admin/categoriainsumo"));
	};

	if (loading) {
		return (
			<p className="text-center text-gray-500 text-xl py-20">
				Cargando datos de la categoría...
			</p>
		);
	}

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Categoría de Insumo
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
				noValidate
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg min-h-[120px]">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						required
						className={`w-full border p-2 rounded ${
							errors.Nombre ? "border-red-500" : "border-gray-300"
						}`}
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<textarea
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						required
						maxLength={100}
						className={`w-full border p-2 rounded ${
							errors.Descripcion ? "border-red-500" : "border-gray-300"
						}`}
						style={{ resize: "vertical" }}
					/>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
				</div>

				<input
					type="checkbox"
					name="Estado"
					checked={formData.Estado}
					disabled
					id="estado-checkbox"
					className="hidden"
				/>

				<div className="md:col-span-2 flex gap-4">
					<Button icon="fa fa-save" className="green" type="submit">
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

export default EditarCatInsumo;
