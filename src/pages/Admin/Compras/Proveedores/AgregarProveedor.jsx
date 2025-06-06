import React, { useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { proveedorService } from "../../../../service/proveedores.service";

const AgregarProveedor = () => {
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Tipo_Proveedor: "",
		NIT: "",
		Nombre_Empresa: "",
		Asesor: "",
		Celular_Empresa: "",
		Celular_Asesor: "",
		Tipo_Documento: "",
		Documento: "",
		Nombre: "",
		Celular: "",
		Email: "",
		Direccion: "",
		Estado: true,
	});

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
			case "Asesor":
				newErrors[name] =
					value.trim().length > 0 && value.length < 3
						? "Debe tener al menos 3 caracteres, sin números o caracteres especiales"
						: "";
				break;

			case "Nombre_Empresa":
				newErrors[name] =
					(value.trim().length > 0 && value.length < 3) ||
					!/^[a-zA-Z0-9\s]*$/.test(value)
						? "Debe tener al menos 3 caracteres, sin caracteres especiales"
						: "";
				break;

			case "NIT":
				newErrors[name] =
					value.trim().length > 0 &&
					(!/^[0-9-]+$/.test(value) || value.length < 9 || value.length > 15)
						? "Solo números y guiones, debe tener entre 9 y 15 caracteres"
						: "";
				break;

			case "Documento":
				newErrors[name] =
					value.trim().length > 0 && !/^\d{9,11}$/.test(value)
						? "Debe ser un documento entre 9 y 11 digitos"
						: "";
				break;

			case "Celular":
			case "Celular_Empresa":
			case "Celular_Asesor":
				newErrors[name] =
					value.trim().length > 0 && !/^\d{9,11}$/.test(value)
						? "Debe ser un numero entre 9 y 11 digitos"
						: "";
				break;

			case "Email":
				newErrors[name] =
					value.trim().length > 0 && value && !/^\S+@\S+\.\S+$/.test(value)
						? "Correo inválido"
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

		if (name === "NIT") {
			const regex = /^[0-9-]*$/;
			if (!regex.test(value)) return;
		}

		if (
			["Celular", "Celular_Empresa", "Celular_Asesor", "Documento"].includes(
				name,
			)
		) {
			const regex = /^\d*$/;
			if (!regex.test(value)) return;
		}

		if (["Nombre", "Asesor"].includes(name)) {
			const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/;
			if (!regex.test(value)) return;
		}

		if (name === "Nombre_Empresa") {
			const regex = /^[a-zA-Z0-9\s]*$/;
			if (!regex.test(value)) return;
		}

		const updatedValue = type === "checkbox" ? checked : value;
		setFormData((prev) => ({
			...prev,
			[name]: updatedValue,
		}));

		validateField(name, updatedValue);
	};

	const handleTipoProveedorChange = (e) => {
		const tipoProveedor = e.target.value;
		setFormData((prev) => ({
			...prev,
			Tipo_Proveedor: tipoProveedor,
			...(tipoProveedor === "Natural"
				? {
						NIT: "",
						Nombre_Empresa: "",
						Asesor: "",
						Celular_Empresa: "",
						Celular_Asesor: "",
					}
				: {
						Tipo_Documento: "",
						Documento: "",
						Nombre: "",
						Celular: "",
					}),
		}));
		setErrors({});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (Object.keys(errors).length > 0) {
			Swal.fire({
				title: "Error",
				text: "Por favor, corrija los errores en el formulario",
				icon: "error",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			});
			return;
		}

		try {
			await proveedorService.crearProveedor(formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "El proveedor ha sido guardado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/proveedores");
			});
			navigate("/admin/proveedores");
		} catch (error) {
			console.error("Error al agregar proveedor:", error);
			alert("Ocurrió un error al agregar el proveedor.");
		}
	};

	const handleCancel = () => {
		Swal.fire({
			title: "¿Estás seguro?",
			text: "Si cancelas, perderás los datos ingresados.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "No, continuar",
			background: "#000",
			color: "#fff",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/proveedores");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Proveedores
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				{/* Tipo de Proveedor */}
				<div
					className={`p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 ${
						formData.Tipo_Proveedor === "Natural"
							? "md:col-span-2"
							: "md:col-span-1"
					}`}
				>
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Tipo de Proveedor <span className="text-red-500">*</span>
					</h3>
					<select
						name="Tipo_Proveedor"
						value={formData.Tipo_Proveedor}
						onChange={handleTipoProveedorChange}
						required
						className="w-full p-2 border rounded"
					>
						<option value="">Seleccione el Tipo</option>
						<option value="Natural">Natural</option>
						<option value="Empresa">Empresa</option>
					</select>
				</div>

				{/* Si es Natural */}
				{formData.Tipo_Proveedor === "Natural" && (
					<>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Tipo de Documento
							</h3>
							<select
								type="text"
								name="Tipo_Documento"
								value={formData.Tipo_Documento}
								onChange={handleChange}
								className="w-full border border-gray-300 p-2 rounded"
							>
								<option value="">Seleccione el Tipo</option>
								<option value="C.C">C.C - Cédula de Ciudadanía</option>
								<option value="C.E">C.E - Cédula de Extranjería</option>
							</select>
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Documento
							</h3>
							<input
								type="text"
								name="Documento"
								value={formData.Documento}
								onChange={handleChange}
								maxLength={11}
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Documento && (
								<p className="text-red-500 text-sm mt-1">{errors.Documento}</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Nombre <span className="text-red-500">*</span>
							</h3>
							<input
								type="text"
								name="Nombre"
								value={formData.Nombre}
								onChange={handleChange}
								maxLength={30}
								required
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Nombre && (
								<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Celular <span className="text-red-500">*</span>
							</h3>
							<input
								type="text"
								name="Celular"
								value={formData.Celular}
								onChange={handleChange}
								maxLength={11}
								required
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Celular && (
								<p className="text-red-500 text-sm mt-1">{errors.Celular}</p>
							)}
						</div>
					</>
				)}

				{/* Si es Empresa */}
				{formData.Tipo_Proveedor === "Empresa" && (
					<>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								NIT <span className="text-red-500">*</span>
							</h3>
							<input
								type="text"
								name="NIT"
								value={formData.NIT}
								onChange={handleChange}
								maxLength={15}
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.NIT && (
								<p className="text-red-500 text-sm mt-1">{errors.NIT}</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Nombre de la Empresa <span className="text-red-500">*</span>
							</h3>
							<input
								type="text"
								name="Nombre_Empresa"
								value={formData.Nombre_Empresa}
								onChange={handleChange}
								maxLength={30}
								required
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Nombre_Empresa && (
								<p className="text-red-500 text-sm mt-1">
									{errors.Nombre_Empresa}
								</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">Asesor</h3>
							<input
								type="text"
								name="Asesor"
								value={formData.Asesor}
								onChange={handleChange}
								maxLength={30}
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Asesor && (
								<p className="text-red-500 text-sm mt-1">{errors.Asesor}</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Celular Empresa <span className="text-red-500">*</span>
							</h3>
							<input
								type="text"
								name="Celular_Empresa"
								value={formData.Celular_Empresa}
								onChange={handleChange}
								maxLength={11}
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Celular_Empresa && (
								<p className="text-red-500 text-sm mt-1">
									{errors.Celular_Empresa}
								</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">
								Celular Asesor
							</h3>
							<input
								type="text"
								name="Celular_Asesor"
								value={formData.Celular_Asesor}
								onChange={handleChange}
								maxLength={11}
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Celular_Asesor && (
								<p className="text-red-500 text-sm mt-1">
									{errors.Celular_Asesor}
								</p>
							)}
						</div>
					</>
				)}

				{/* Email y Direccion (ambos tipos) */}
				{formData.Tipo_Proveedor && (
					<>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Email <span className="text-red-500">*</span>
							</h3>
							<input
								type="email"
								name="Email"
								value={formData.Email}
								onChange={handleChange}
								required
								className="w-full border border-gray-300 p-2 rounded"
							/>
							{errors.Email && (
								<p className="text-red-500 text-sm mt-1">{errors.Email}</p>
							)}
						</div>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">Dirección</h3>
							<input
								type="text"
								name="Direccion"
								value={formData.Direccion}
								onChange={handleChange}
								maxLength={30}
								className="w-full border border-gray-300 p-2 rounded"
							/>
						</div>
					</>
				)}

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						type="submit"
						className="green"
						disabled={Object.keys(errors).length > 0}
					>
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
		</>
	);
};

export default AgregarProveedor;
