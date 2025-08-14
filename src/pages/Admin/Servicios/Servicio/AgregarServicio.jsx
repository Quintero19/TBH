import { showAlert } from "@/components/AlertProvider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Buttons/Button";
import { servicioService } from "../../../../service/serviciosService";

const AgregarServicio = () => {
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});
	const [imagenes, setImagenes] = useState([]);
	const maxImagenes = 3;

	const [formData, setFormData] = useState({
		Nombre: "",
		Precio: "",
		Duracion: "",
		Descripcion: "",
		Estado: true,
	});

	const isFormValid = () => {
		const requiredFields = ["Nombre", "Precio", "Duracion", "Descripcion"];
		const allFieldsFilled = requiredFields.every(
			(field) => formData[field] && formData[field].toString().trim() !== "",
		);
		const noErrors = Object.keys(errors).length === 0;
		return allFieldsFilled && noErrors && imagenes.length > 0;
	};

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre": {
				const regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
				if (value.trim().length === 0) {
					newErrors[name] = "El nombre es requerido";
				} else if (!regex.test(value)) {
					newErrors[name] = "No se permiten números ni caracteres especiales";
				} else if (value.trim().length < 3) {
					newErrors[name] = "Debe tener al menos 3 caracteres";
				} else if (value.trim().length > 30) {
					newErrors[name] = "No puede exceder los 30 caracteres";
				} else {
					delete newErrors[name];
				}
				break;
			}

			case "Precio":
				if (value.trim().length === 0) {
					newErrors[name] = "El precio es requerido";
				} else if (/[eE]/.test(value)) {
					newErrors[name] = "No se permite la notación científica (e)";
				} else if (Number.isNaN(Number(value)) || Number(value) <= 0) {
					newErrors[name] = "Debe ser un número mayor a 0";
				} else {
					delete newErrors[name];
				}
				break;

			case "Duracion": {
				const isValid =
					/^[0-9]+$/.test(value) &&
					Number.parseInt(value) > 0 &&
					Number.parseInt(value) <= 120;
				if (value.trim().length === 0) {
					newErrors[name] = "La duración es requerida";
				} else if (!isValid) {
					newErrors[name] =
						"Debe ser un número entero entre 1 y 120 minutos (2 horas)";
				} else {
					delete newErrors[name];
				}
				break;
			}

			case "Descripcion":
				if (value.trim().length === 0) {
					newErrors[name] = "La descripción es requerida";
				} else if (value.length < 5 || value.length > 150) {
					newErrors[name] = "Debe tener al menos 5 caracteres y máximo 150";
				} else {
					delete newErrors[name];
				}
				break;

			case "imagenes":
				if (imagenes.length === 0) {
					newErrors[name] = "Debes subir al menos dos imagen";
				} else {
					delete newErrors[name];
				}
				break;

			default:
				break;
		}

		setErrors(newErrors);
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const updatedValue = type === "checkbox" ? checked : value;

		if (
			(name === "Precio" || name === "Duracion") &&
			value !== "" &&
			Number.isNaN(value)
		)
			return;

		setFormData((prev) => ({
			...prev,
			[name]: updatedValue,
		}));

		validateField(name, updatedValue);
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const newImages = [...imagenes, ...files].slice(0, maxImagenes);
		setImagenes(newImages);
		validateField("imagenes", newImages);
	};

	const removeImage = (index) => {
		const newImages = imagenes.filter((_, i) => i !== index);
		setImagenes(newImages);
		validateField("imagenes", newImages);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const requiredFields = ["Nombre", "Precio", "Duracion", "Descripcion"];
		const newErrors = {};

		requiredFields.forEach((field) => {
			const value = formData[field];
			validateField(field, value);
			if (!value || value.toString().trim() === "") {
				newErrors[field] = "Este campo es obligatorio";
			}
		});

		if (imagenes.length === 0) {
			newErrors.imagenes = "Debes subir al menos una imagen";
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			showAlert(
				"Por favor completa todos los campos obligatorios y corrige los errores.",
				{
					type: "error",
					title: "Formulario incompleto",
					duration: 2500,
				},
			);
			return;
		}

		try {
			const formDataToSend = new FormData();

			// Campos de texto
			formDataToSend.append("Nombre", formData.Nombre);
			formDataToSend.append("Precio", formData.Precio);
			formDataToSend.append("Duracion", formData.Duracion);
			formDataToSend.append("Descripcion", formData.Descripcion);
			// Agrega más campos si los tienes (como categoría, etc.)

			// Imágenes (puedes tener múltiples)
			imagenes.forEach((img) => {
				formDataToSend.append("imagenes", img); // 👈 nombre debe coincidir con multer: 'imagenes'
			});

			// Enviar como multipart/form-data
			await servicioService.crearServicio(formDataToSend, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			showAlert("El servicio ha sido guardado correctamente.", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/servicios");
			});
		} catch (error) {
			console.error("Error al agregar servicio:", error);
			showAlert("Error al agregar servicio", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			title: "¿Estás seguro?",
			type: "warning",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "Continuar",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/servicios");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Servicio
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				{/* Nombre */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						maxLength={30}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				{/* Precio */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Precio <span className="text-red-500">*</span>
					</h3>
					<input
						type="number"
						step="0.01"
						min="0"
						name="Precio"
						value={formData.Precio}
						onChange={(e) => {
							const value = e.target.value;
							const digitsOnly = value.replace(".", "");
							if (digitsOnly.length <= 6) {
								handleChange(e);
							}
						}}
						onKeyDown={(e) => {
							const allowedKeys = [
								"0",
								"1",
								"2",
								"3",
								"4",
								"5",
								"6",
								"7",
								"8",
								"9",
								".",
								"Backspace",
								"Tab",
								"Delete",
								"ArrowLeft",
								"ArrowRight",
							];
							if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
								e.preventDefault();
							}
							if (e.key === "." && e.target.value.includes(".")) {
								e.preventDefault();
							}
						}}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Precio && (
						<p className="text-red-500 text-sm mt-1">{errors.Precio}</p>
					)}
				</div>

				{/* Duración */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Duración (min) <span className="text-red-500">*</span>
					</h3>
					<input
						type="number"
						name="Duracion"
						value={formData.Duracion}
						onChange={handleChange}
						min="1"
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Duracion && (
						<p className="text-red-500 text-sm mt-1">{errors.Duracion}</p>
					)}
				</div>

				{/* Descripción */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<textarea
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						maxLength={150}
						required
						className="w-full p-2 border border-gray-300 rounded"
						rows={3}
					/>
					<small className="text-gray-500 text-sm">
						{formData.Descripcion.length}/150 caracteres
					</small>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
				</div>

				{/* Imágenes */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Imágenes{" "}
						{errors.imagenes && <span className="text-red-500">*</span>}
					</h3>
					<div className="flex flex-wrap justify-start gap-4 mb-4">
						{imagenes.map((file, idx) => (
							<div
								key={idx}
								className="relative w-[200px] h-[200px] rounded overflow-hidden border shadow-md"
							>
								<img
									src={URL.createObjectURL(file)}
									alt={`preview-${idx}`}
									className="object-cover w-full h-full"
								/>
								<div className="absolute top-1 right-1 z-20">
									<Button
										onClick={() => removeImage(idx)}
										className="red"
										icon="fa-times"
									/>
								</div>
							</div>
						))}
					</div>
					{errors.imagenes && (
						<p className="text-red-500 text-sm mb-2">{errors.imagenes}</p>
					)}
					<div className="relative inline-block">
						<Button
							className="blue"
							icon="fa-upload"
							disabled={imagenes.length >= maxImagenes}
						>
							<div className="flex items-center gap-2">
								Seleccionar Imágenes
							</div>
						</Button>
						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleImageChange}
							disabled={imagenes.length >= maxImagenes}
							className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
						/>
					</div>
				</div>

				{/* Botones */}
				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						type="submit"
						className="green"
						disabled={!isFormValid()}
						icon="fa-floppy-o"
					>
						<div className="flex items-center gap-2">Guardar</div>
					</Button>
					<Button
						type="button"
						className="red"
						onClick={handleCancel}
						icon="fa-times"
					>
						<div className="flex items-center gap-2">Cancelar</div>
					</Button>
				</div>
			</form>
		</>
	);
};

export default AgregarServicio;
