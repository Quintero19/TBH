import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AgregarCatInsumo = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true,
	});
	const [errors, setErrors] = useState({});

	/* ---------- Validar todo el formulario ---------- */
	const validateForm = () => {
		const newErrors = {};

		const nombre = formData.Nombre.trim();
		const descripcion = formData.Descripcion.trim();

		// Validación del nombre según análisis: min 3 caracteres, solo letras y números sin espacios
		if (!nombre) {
			newErrors.Nombre = "El nombre es obligatorio";
		} else if (nombre.length < 3) {
			newErrors.Nombre = "Mínimo 3 caracteres";
		} else if (!/^[a-zA-Z0-9]+$/.test(nombre)) {
			newErrors.Nombre = "Solo letras y números, sin espacios";
		}

		// Validación de la descripción según análisis: min 5 caracteres, máx 100 caracteres
		if (!descripcion) {
			newErrors.Descripcion = "La descripción es obligatoria";
		} else if (descripcion.length < 5) {
			newErrors.Descripcion = "Mínimo 5 caracteres para la descripción";
		} else if (descripcion.length > 100) {
			newErrors.Descripcion = "Máximo 100 caracteres permitidos";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/* ---------- Validación en tiempo real por campo ---------- */
	const validateField = (name, value) => {
		const newErrors = { ...errors };

		if (name === "Nombre") {
			const nombre = value.trim();
			if (!nombre) {
				newErrors.Nombre = "El nombre es obligatorio";
			} else if (nombre.length < 3) {
				newErrors.Nombre = "Mínimo 3 caracteres";
			} else if (!/^[a-zA-Z0-9]+$/.test(nombre)) {
				newErrors.Nombre = "Solo letras y números, sin espacios";
			} else {
				delete newErrors.Nombre;
			}
		}

		if (name === "Descripcion") {
			const descripcion = value.trim();
			if (!descripcion) {
				newErrors.Descripcion = "La descripción es obligatoria";
			} else if (descripcion.length < 5) {
				newErrors.Descripcion = "Mínimo 5 caracteres para la descripción";
			} else if (descripcion.length > 100) {
				newErrors.Descripcion = "Máximo 100 caracteres permitidos";
			} else {
				delete newErrors.Descripcion;
			}
		}

		setErrors(newErrors);
	};

	/* ---------- Manejo de cambios (onChange) ---------- */
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Validación en tiempo real al escribir
		validateField(name, value);
	};

	/* ---------- Validación al perder foco (onBlur) ---------- */
	const handleBlur = (e) => {
		const { name, value } = e.target;
		// Validación adicional al perder foco
		validateField(name, value);
	};

	/* ---------- Guardar ---------- */
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			showAlert("Corrige los errores antes de guardar", {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		try {
			// Verificar si ya existe una categoría con el mismo nombre
			const categoriasExistentes =
				await categoriaInsumoService.obtenerCategorias();
			const yaExiste = categoriasExistentes.data.some(
				(c) =>
					c.Nombre.toLowerCase().trim() ===
					formData.Nombre.toLowerCase().trim(),
			);

			if (yaExiste) {
				showAlert("Ya existe una categoría con ese nombre", {
					type: "warning",
					title: "Categoría duplicada",
					duration: 2500,
				});
				return;
			}

			// Si no existe, la crea
			await categoriaInsumoService.crearCategoria(formData);
			await showAlert("La categoría fue creada exitosamente", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/categoriainsumo");
		} catch (err) {
			console.error(err);
			const mensaje =
				err.response?.data?.message || "Ocurrió un error al guardar";
			showAlert(`Error al guardar: ${mensaje}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	/* ---------- Cancelar ---------- */
	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			type: "warning",
			title: "¿Cancelar?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((r) => r.isConfirmed && navigate("/admin/categoriainsumo"));
	};

	/* ---------- Render ---------- */
	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Categoría de Insumo
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 min-h-[120px]">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						onBlur={handleBlur}
						required
						className={`w-full border p-2 rounded ${
							errors.Nombre ? "border-red-500" : "border-gray-300"
						}`}
						placeholder="Ingrese el nombre de la categoría"
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<textarea
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						onBlur={handleBlur}
						required
						maxLength={100}
						className={`w-full border p-2 rounded ${
							errors.Descripcion ? "border-red-500" : "border-gray-300"
						}`}
						style={{ resize: "vertical" }}
						placeholder="Ingrese la descripción de la categoría"
					/>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
					<p className="text-gray-500 text-xs mt-1">
						{formData.Descripcion.length}/100 caracteres
					</p>
				</div>

				<div className="md:col-span-2 flex gap-4">
					<Button 
						icon="fa-floppy-o" 
						className="green" 
						type="submit"
						disabled={Object.keys(errors).length > 0}
					>
						Guardar
					</Button>
					<Button icon="fa-times" className="red" onClick={handleCancel}>
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};

export default AgregarCatInsumo;
