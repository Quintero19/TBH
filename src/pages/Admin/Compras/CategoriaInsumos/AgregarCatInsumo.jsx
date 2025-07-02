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

		if (!nombre) {
			newErrors.Nombre = "El nombre es obligatorio";
		} else if (nombre.length < 3) {
			newErrors.Nombre = "Mínimo 3 letras";
		} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre)) {
			newErrors.Nombre = "Solo caracteres alfabéticos permitidos";
		}

		if (!descripcion) {
			newErrors.Descripcion = "La descripción es obligatoria";
		} else if (descripcion.length < 5) {
			newErrors.Descripcion = "Mínimo 5 caracteres para la descripción";
		} else if (descripcion.length > 100) {
			newErrors.Descripcion = "Máximo 100 caracteres permitidos";
		}
		else if (!/^[a-zA-Z0-9]+$/.test(nombre)) {
			newErrors.Nombre = "Solo letras y números, sin espacios";
		}


		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		if (name === "Nombre") {
			if (!value.trim()) {
				newErrors.Nombre = "El nombre es obligatorio";
			} else if (value.length < 3) {
				newErrors.Nombre = "Mínimo 3 caracteres";
			} else if (!/^[a-zA-Z0-9]+$/.test(value)) {
				newErrors.Nombre = "Solo letras y números, sin espacios";
			} else {
				delete newErrors.Nombre;
			}
		}

		if (name === "Descripcion") {
			if (!value.trim()) {
				newErrors.Descripcion = "La descripción es obligatoria";
			} else if (value.length < 5) {
				newErrors.Descripcion = "Mínimo 5 caracteres para la descripción";
			} else if (value.length > 100) {
				newErrors.Descripcion = "Máximo 100 caracteres permitidos";
			} else {
				delete newErrors.Descripcion;
			}
		}

		setErrors(newErrors);
	};



	/* ---------- Manejo de cambios ---------- */
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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
			const categoriasExistentes = await categoriaInsumoService.obtenerCategorias();
			const yaExiste = categoriasExistentes.data.some(
				(c) => c.Nombre.toLowerCase().trim() === formData.Nombre.toLowerCase().trim()
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
			const mensaje = err.response?.data?.message || "Ocurrió un error al guardar";
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
						required
						className="w-full border border-gray-300 p-2 rounded"
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
						required
						maxLength={100}
						className="w-full border border-gray-300 p-2 rounded"
						style={{ resize: "vertical" }}
					/>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
				</div>

				<div className="md:col-span-2 flex gap-4">
					<Button icon="fa-floppy-o" className="green" type="submit">
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
