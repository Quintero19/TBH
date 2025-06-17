import { showAlert } from "@/components/AlertProvider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Buttons/Button";
import { empleadoService } from "../../../../service/empleado.service";

const AgregarEmpleado = () => {
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Tipo_Documento: "",
		Documento: "",
		Nombre: "",
		Celular: "",
		F_Nacimiento: "",
		Direccion: "",
		Sexo: "",
		Estado: true,
	});

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
				newErrors[name] =
					value.trim().length > 0 && value.length < 3
						? "Debe tener al menos 3 caracteres, sin números o caracteres especiales"
						: "";
				break;

			case "Documento":
				newErrors[name] =
					value.trim().length > 0 && !/^\d{10,12}$/.test(value)
						? "Debe ser un documento entre 10 y 12 dígitos"
						: "";
				break;

			case "Celular":
				newErrors[name] =
					value.trim().length > 0 && !/^\d{9,11}$/.test(value)
						? "Debe ser un número entre 9 y 11 dígitos"
						: "";
				break;

			case "F_Nacimiento":
				if (value) {
					const birthDate = new Date(value);
					const minDate = new Date();
					minDate.setFullYear(minDate.getFullYear() - 100);
					const maxDate = new Date();
					maxDate.setFullYear(maxDate.getFullYear() - 18);

					if (birthDate < minDate || birthDate > maxDate) {
						newErrors[name] = "La edad debe estar entre 18 y 100 años";
					}
				}
				break;

			case "Sexo":
			case "Tipo_Documento":
				newErrors[name] =
					value.trim().length === 0 ? "Este campo es requerido" : "";
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

		if (["Documento", "Celular"].includes(name)) {
			const regex = /^\d*$/;
			if (!regex.test(value)) return;
		}

		if (name === "Nombre") {
			const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/;
			if (!regex.test(value)) return;
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

		const requiredFields = [
			"Tipo_Documento",
			"Documento",
			"Nombre",
			"Celular",
			"F_Nacimiento",
			"Sexo",
		];
		const newErrors = { ...errors };

		requiredFields.forEach((field) => {
			if (!formData[field]) {
				newErrors[field] = "Este campo es requerido";
			}
		});

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			showAlert("Por favor corrige los errores en el formulario", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
			return;
		}

		try {
			await empleadoService.crearEmpleado(formData);
			showAlert("El empleado ha sido guardado correctamente.", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/empleado");
			});
		} catch (error) {
			console.error("Error al agregar empleado:", error);
			showAlert(
				`Error al agregar empleado: ${error.message || "Error desconocido"}`,
				{
					type: "error",
					title: "Error",
					duration: 2000,
				},
			);
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			title: "¿Estás seguro?",
			type: "warning",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "Continuar registrando",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/empleado");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Empleado
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Tipo de Documento <span className="text-red-500">*</span>
					</h3>
					<select
						name="Tipo_Documento"
						value={formData.Tipo_Documento}
						onChange={handleChange}
						required
						className={`w-full p-2 border rounded ${errors.Tipo_Documento ? "border-red-500" : ""}`}
					>
						<option value="">Seleccione el Tipo</option>
						<option value="C.C">C.C - Cédula de Ciudadanía</option>
						<option value="T.E">T.E - Tarjeta de Identidad</option>
						<option value="C.E">C.E - Cédula de Extranjería</option>
						<option value="P.P">P.P - Pasaporte</option>
						<option value="PEP">PEP - Permiso Especial de Permanencia</option>
					</select>
					{errors.Tipo_Documento && (
						<p className="text-red-500 text-sm mt-1">{errors.Tipo_Documento}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Documento <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Documento"
						value={formData.Documento}
						onChange={handleChange}
						maxLength={15}
						required
						className={`w-full p-2 border border-gray-300 rounded ${errors.Documento ? "border-red-500" : ""}`}
					/>
					{errors.Documento && (
						<p className="text-red-500 text-sm mt-1">{errors.Documento}</p>
					)}
				</div>

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
						className={`w-full p-2 border border-gray-300 rounded ${errors.Nombre ? "border-red-500" : ""}`}
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Celular <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Celular"
						value={formData.Celular}
						onChange={handleChange}
						maxLength={15}
						required
						className={`w-full p-2 border border-gray-300 rounded ${errors.Celular ? "border-red-500" : ""}`}
					/>
					{errors.Celular && (
						<p className="text-red-500 text-sm mt-1">{errors.Celular}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Fecha de Nacimiento <span className="text-red-500">*</span>
					</h3>
					<input
						type="date"
						name="F_Nacimiento"
						value={formData.F_Nacimiento}
						onChange={handleChange}
						required
						className={`w-full p-2 border border-gray-300 rounded ${errors.F_Nacimiento ? "border-red-500" : ""}`}
						max={
							new Date(new Date().setFullYear(new Date().getFullYear() - 14))
								.toISOString()
								.split("T")[0]
						}
						min={
							new Date(new Date().setFullYear(new Date().getFullYear() - 100))
								.toISOString()
								.split("T")[0]
						}
					/>
					{errors.F_Nacimiento && (
						<p className="text-red-500 text-sm mt-1">{errors.F_Nacimiento}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Dirección</h3>
					<input
						type="text"
						name="Direccion"
						value={formData.Direccion}
						onChange={handleChange}
						maxLength={50}
						className="w-full p-2 border border-gray-300 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Sexo <span className="text-red-500">*</span>
					</h3>
					<select
						name="Sexo"
						value={formData.Sexo}
						onChange={handleChange}
						required
						className={`w-full p-2 border rounded ${errors.Sexo ? "border-red-500" : ""}`}
					>
						<option value="">Seleccione el Sexo</option>
						<option value="M">Masculino</option>
						<option value="F">Femenino</option>
					</select>
					{errors.Sexo && (
						<p className="text-red-500 text-sm mt-1">{errors.Sexo}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 flex items-center gap-3">
					<label className="text-xl font-semibold text-black">Estado</label>
					<input
						type="checkbox"
						name="Estado"
						checked={formData.Estado}
						onChange={handleChange}
						className="w-5 h-5"
					/>
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

export default AgregarEmpleado;
