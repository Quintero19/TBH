import React, { useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { clienteService } from "@/service/clientes.service";

export default function AgregarCliente() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		TipoDocumento: "",
		Documento: "",
		Nombre: "",
		Correo: "",
		Celular: "",
		Direccion: "",
		FechaNacimiento: "",
		Estado: true,
	});

	const [validationErrors, setValidationErrors] = useState({});

	const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const validateField = (name, value) => {
		let error = "";
		switch (name) {
			case "TipoDocumento":
				if (!value) {
					error = "Debe seleccionar un tipo de documento.";
				}
				break;
			case "Documento":
				if (!value) {
					error = "Debe completar el campo documento.";
				} else if (value.length < 5 || value.length > 15) {
					error = "El documento debe tener entre 5 y 15 dígitos.";
				}
				break;
			case "Nombre":
				if (!value) {
					error = "Debe completar el campo nombre.";
				}
				break;
			case "Correo":
				if (!value) {
					error = "Debe completar el campo correo.";
				} else if (!correoRegex.test(value)) {
					error = "El correo ingresado no es válido.";
				}
				break;
			case "Celular":
				if (!value) {
					error = "Debe completar el campo celular.";
				}
				break;
			case "Direccion":
				if (!value) {
					error = "Debe completar el campo dirección.";
				}
				break;
			case "FechaNacimiento":
				if (!value) {
					error = "Debe seleccionar una fecha de nacimiento.";
				}
				break;
			default:
				break;
		}
		setValidationErrors((prevErrors) => ({
			...prevErrors,
			[name]: error,
		}));
		return error;
	};

	const validateForm = () => {
		let isValid = true;
		const newErrors = {};

		for (const [name, value] of Object.entries(formData)) {
			if (name !== "Estado") {
				const error = validateField(name, value);
				if (error) {
					newErrors[name] = error;
					isValid = false;
				}
			}
		}
		setValidationErrors(newErrors);
		return isValid;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		let val = value;

		if (name === "Estado") {
			val = value === "true";
		}

		setFormData({
			...formData,
			[name]: val,
		});

		validateField(name, val);
	};

	const handleBlur = (e) => {
		const { name, value } = e.target;
		validateField(name, value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			showAlert("Por favor, corrige los errores en el formulario.", {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		try {
			await clienteService.crearCliente(formData);

			showAlert("El cliente ha sido guardado correctamente.", {
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/clientes");
			});
		} catch (error) {
			console.error("Error al guardar cliente (frontend):", error);
			const errorMessage =
				error.response && error.response.data && error.response.data.message
					? error.response.data.message
					: error.message || "Ocurrió un error al guardar el cliente.";
			showAlert(errorMessage, {
				type: "error",
				title: "Error",
			});
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			type: "warning",
			title: "¿Estás seguro?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "No, continuar",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/clientes");
			}
		});
	};

	return (
		<div className="flex">
			<div className="grow p-6">
				<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
					Agregar Cliente
				</h1>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					{/* Tipo de Documento */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Tipo de Documento <span className="text-red-500">*</span>
						</h3>
						<select
							name="TipoDocumento"
							value={formData.TipoDocumento}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						>
							<option value="">Selecciona tipo</option>
							<option value="T.I">T.I</option>
							<option value="C.C">C.C</option>
						</select>
						{validationErrors.TipoDocumento && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.TipoDocumento}
							</p>
						)}
					</div>

					{/* Documento */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Documento <span className="text-red-500">*</span>
						</h3>
						<input
							type="number"
							name="Documento"
							value={formData.Documento}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						/>
						{validationErrors.Documento && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.Documento}
							</p>
						)}
					</div>

					{/* Nombre(s) y Apellidos */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-1">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Nombre(s) y Apellidos <span className="text-red-500">*</span>
						</h3>
						<input
							type="text"
							name="Nombre"
							value={formData.Nombre}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						/>
						{validationErrors.Nombre && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.Nombre}
							</p>
						)}
					</div>

					{/* Correo */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Correo <span className="text-red-500">*</span>
						</h3>
						<input
							type="email"
							name="Correo"
							value={formData.Correo}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						/>
						{validationErrors.Correo && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.Correo}
							</p>
						)}
					</div>

					{/* Celular */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Celular <span className="text-red-500">*</span>
						</h3>
						<input
							type="number"
							name="Celular"
							value={formData.Celular}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						/>
						{validationErrors.Celular && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.Celular}
							</p>
						)}
					</div>

					{/* Dirección */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Dirección <span className="text-red-500">*</span>
						</h3>
						<input
							type="text"
							name="Direccion"
							value={formData.Direccion}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						/>
						{validationErrors.Direccion && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.Direccion}
							</p>
						)}
					</div>

					{/* Fecha de Nacimiento */}
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Fecha de Nacimiento <span className="text-red-500">*</span>
						</h3>
						<input
							type="date"
							name="FechaNacimiento"
							value={formData.FechaNacimiento}
							onChange={handleChange}
							onBlur={handleBlur}
							className="w-full p-2 border rounded"
						/>
						{validationErrors.FechaNacimiento && (
							<p className="text-red-500 text-sm mt-1">
								{validationErrors.FechaNacimiento}
							</p>
						)}
					</div>

					<div className="md:col-span-2 flex gap-2 ml-7">
						<Button type="submit" className="green">
							<div className="flex items-center gap-2">
								<FaSave />
								Guardar
							</div>
						</Button>

						<Button className="red" onClick={handleCancel}>
							<div className="flex items-center gap-2">
								<IoClose />
								Cancelar
							</div>
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
