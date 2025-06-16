import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { proveedorService } from "@/service/proveedores.service";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarProveedor = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Id_Proveedores: "",
		Tipo_Proveedor: "",
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

	useEffect(() => {
		const cargarProveedor = async () => {
			try {
				const data = await proveedorService.obtenerProveedorPorId(id);
				setFormData(data.data);
			} catch (error) {
				console.error("Error al cargar proveedor:", error);
				showAlert("Error al cargar el proveedor", {
					type: "error",
					title: "Error",
					duration: 2000,
				});
				navigate("/admin/proveedores");
			}
		};

		cargarProveedor();
	}, [id, navigate]);

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio";
				} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/.test(value)) {
					newErrors[name] = "Solo letras y espacios";
				} else if (value.length < 3) {
					newErrors[name] = "Debe tener al menos 3 caracteres";
				} else if (value.length > 30) {
					newErrors[name] = "Máximo 30 caracteres";
				} else {
					delete newErrors[name];
				}
				break;

			case "Asesor":
				if (value) {
					if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/.test(value)) {
						newErrors[name] = "Solo letras y espacios";
					} else if (value.length < 3) {
						newErrors[name] = "Debe tener al menos 3 caracteres";
					} else if (value.length > 30) {
						newErrors[name] = "Máximo 30 caracteres";
					} else {
						delete newErrors[name];
					}
				} else {
					delete newErrors[name];
				}
				break;

			case "Nombre_Empresa":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio";
				} else if (!/^[a-zA-Z0-9\s]*$/.test(value)) {
					newErrors[name] = "Solo letras, números y espacios";
				} else if (value.length < 3) {
					newErrors[name] = "Debe tener al menos 3 caracteres";
				} else if (value.length > 30) {
					newErrors[name] = "Máximo 30 caracteres";
				} else {
					delete newErrors[name];
				}
				break;

			case "NIT":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio";
				} else if (!/^[0-9-]+$/.test(value)) {
					newErrors[name] = "Solo números y guiones";
				} else if (value.length < 9 || value.length > 15) {
					newErrors[name] = "Debe tener entre 9 y 15 caracteres";
				} else {
					delete newErrors[name];
				}
				break;

			case "Documento":
				if (value && !/^\d{9,11}$/.test(value)) {
					newErrors[name] = "Debe tener entre 9 y 11 dígitos";
				} else {
					delete newErrors[name];
				}
				break;

			case "Celular":
			case "Celular_Empresa":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio";
				} else if (!/^\d{9,11}$/.test(value)) {
					newErrors[name] = "Debe tener entre 9 y 11 dígitos";
				} else {
					delete newErrors[name];
				}
				break;

			case "Celular_Asesor":
				if (value && !/^\d{9,11}$/.test(value)) {
					newErrors[name] = "Debe tener entre 9 y 11 dígitos";
				} else {
					delete newErrors[name];
				}
				break;

			case "Email":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio";
				} else if (!/^\S+@\S+\.\S+$/.test(value)) {
					newErrors[name] = "Correo inválido";
				} else {
					delete newErrors[name];
				}
				break;

			case "Direccion":
				if (value.length > 30) {
					newErrors[name] = "Máximo 30 caracteres";
				} else {
					delete newErrors[name];
				}
				break;

			case "Tipo_Proveedor":
				if (!value) {
					newErrors[name] = "Debe seleccionar una opción";
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
		}));
		setErrors({});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const tipoProveedor = formData.Tipo_Proveedor;
		let datosLimpios = { ...formData };

		if (tipoProveedor === "Natural") {
			datosLimpios = {
				...datosLimpios,
				NIT: "",
				Nombre_Empresa: "",
				Asesor: "",
				Celular_Empresa: "",
				Celular_Asesor: "",
			};
		} else if (tipoProveedor === "Empresa") {
			datosLimpios = {
				...datosLimpios,
				Tipo_Documento: "",
				Documento: "",
				Nombre: "",
				Celular: "",
			};
		}

		if (Object.keys(errors).length > 0) {
			showAlert("Por favor Corregir los errores en el formulario", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
			return;
		}

		try {
			await proveedorService.actualizarProveedor(id, datosLimpios);
			showAlert("El proveedor ha sido actualizado correctamente.", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/proveedores");
			});
		} catch (error) {
			console.error("Error al actualizar proveedor:", error);
			showAlert("No se pudo actualizar el proveedor", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
		}
	};

	const handleCancel = () => {
		window
			.showAlert("Si cancelas, perderás los datos ingresados.", {
				title: "¿Estás seguro?",
				type: "warning",
				showConfirmButton: true,
				showCancelButton: true,
				confirmButtonText: "Sí, cancelar",
				cancelButtonText: "Continuar Editando",
			})
			.then((result) => {
				if (result.isConfirmed) {
					navigate("/admin/proveedores");
				}
			});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Proveedor
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
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

export default EditarProveedor;
