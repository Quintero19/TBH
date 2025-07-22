import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AgregarRol() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true,
	});

	const [errors, setErrors] = useState({});

	const validateField = (name, value) => {
		const newErrors = { ...errors };
		const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

		switch (name) {
			case "Nombre":
				if (!value.trim()) {
					newErrors[name] = "El nombre es requerido";
				} else if (!regex.test(value)) {
					newErrors[name] = "El nombre solo debe contener letras y espacios";
				} else if (value.trim().length < 5 || value.trim().length > 30) {
					newErrors[name] = "Debe tener entre 5 y 30 caracteres";
				} else {
					newErrors[name] = "";
				}
				break;

			case "Descripcion":
				if (!value.trim()) {
					newErrors[name] = "La descripción es requerida";
				} else if (!regex.test(value)) {
					newErrors[name] =
						"La descripción solo debe contener letras y espacios";
				} else if (value.trim().length < 5 || value.trim().length > 120) {
					newErrors[name] = "Debe tener entre 5 y 120 caracteres";
				} else {
					newErrors[name] = "";
				}
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
		const val = type === "checkbox" ? checked : value;

		setFormData((prev) => ({
			...prev,
			[name]: val,
		}));

		validateField(name, val);
	};

	const validarCampos = () => {
		const requiredFields = ["Nombre", "Descripcion"];
		let isValid = true;

		requiredFields.forEach((field) => {
			const value = formData[field]?.trim();
			if (!value) {
				showAlert(`El campo ${field} es obligatorio.`, {
					type: "error",
					title: "Validación",
				});
				isValid = false;
			} else {
				validateField(field, value);
			}
		});

		if (Object.keys(errors).length > 0) {
			showAlert("Corrige los errores antes de guardar.", {
				type: "error",
				title: "Validación",
			});
			isValid = false;
		}

		return isValid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validarCampos()) return;

		try {
			const nuevoRol = await rolService.crearRoles(formData);

			showAlert("El Rol ha sido guardado correctamente.", {
				type: "success",
				duration: 1500,
			}).then(() => {
				if (nuevoRol.data.Id) {
					navigate(`/admin/roles/asignar/${nuevoRol.data.Id}`);
				} else {
					navigate("/admin/roles");
				}
			});
		} catch (error) {
			const mensaje =
				error.response?.data?.message || "Error al obtener los usuarios.";
			showAlert(`Error: ${mensaje || error}`, {
				title: "Error",
				icon: "error",
			});
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			type: "warning",
			title: "¿Cancelar?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/roles");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">Agregar Rol</h1>

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
						className="w-full p-2 border border-gray-300 rounded"
						maxLength={50}
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						className="w-full p-2 border border-gray-300 rounded"
						maxLength={120}
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
}
