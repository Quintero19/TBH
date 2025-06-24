import { showAlert } from "@/components/AlertProvider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Buttons/Button";
import { servicioService } from "../../../../service/serviciosService";

const AgregarServicio = () => {
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Nombre: "",
		Precio: "",
		Duracion: "",
		Descripcion: "",
		Estado: true,
	});

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
				} else {
					newErrors[name] = "";
				}
				break;
			}

			case "Precio":
				newErrors[name] =
					value.trim().length > 0 && /[eE]/.test(value)
						? "No se permite la notación científica (e)"
						: value.trim().length > 0 &&
								(Number.isNaN(value) || Number(value) <= 0)
							? "Debe ser un número mayor a 0"
							: "";
				break;

			case "Duracion": {
				const isValid =
					/^[0-9]+$/.test(value) &&
					Number.parseInt(value) > 0 &&
					Number.parseInt(value) <= 120;

				newErrors[name] =
					value.trim().length > 0 && !isValid
						? "Debe ser un número entero entre 1 y 120 minutos (2 horas)"
						: "";
				break;
			}

			case "Descripcion":
				newErrors[name] =
					value.trim().length > 0 && (value.length < 5 || Number(value) > 120)
						? "Debe tener al menos 5 caracteres y maximo 120"
						: "";
				break;

			default:
				break;
		}

		if (newErrors[name] === "") {
			delete newErrors[name];
		}

		setErrors(newErrors);
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// Special handling for numeric fields
		if (name === "Precio" || name === "Duracion") {
			if (value !== "" && Number.isNaN(value)) return;
		}

		const updatedValue = type === "checkbox" ? checked : value;
		setFormData((prev) => ({
			...prev,
			[name]: updatedValue,
		}));

		validateField(name, updatedValue);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate required fields
		const requiredFields = ["Nombre", "Precio", "Duracion", "Descripcion"];
		const missingFields = requiredFields.filter(
			(field) => !formData[field] || formData[field].toString().trim() === "",
		);

		if (missingFields.length > 0 || Object.keys(errors).length > 0) {
			showAlert(
				"Por favor complete todos los campos obligatorios y corrija los errores",
				{
					type: "error",
					title: "Error",
					duration: 2000,
				},
			);
			return;
		}

		try {
			const payload = {
				...formData,
				Precio: Number.parseFloat(formData.Precio),
				Duracion: Number.parseInt(formData.Duracion),
			};

			await servicioService.crearServicio(payload);
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
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						maxLength={50}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

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
						onChange={handleChange}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Precio && (
						<p className="text-red-500 text-sm mt-1">{errors.Precio}</p>
					)}
				</div>

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

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<textarea
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						maxLength={200}
						required
						className="w-full p-2 border border-gray-300 rounded"
						rows={3}
					/>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						type="submit"
						className="green"
						disabled={Object.keys(errors).length > 0}
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
