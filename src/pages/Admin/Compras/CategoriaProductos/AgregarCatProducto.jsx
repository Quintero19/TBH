import React, { useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "../../../../components/Buttons/Button";
import { catProductoService } from "../../../../service/categoriaProducto.service";

const AgregarCatProducto = () => {
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Es_Ropa: false,
		Estado: true,
	});

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
			case "Descripcion":
				newErrors[name] =
					value.trim().length > 0 && value.length < 3
						? "Debe tener al menos 3 caracteres, sin números o caracteres especiales"
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

		let updatedValue = type === "checkbox" ? checked : value;

		if (name === "Nombre") {
			const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/;
			if (!regex.test(value)) {
				return; 
			}
		}

		setFormData((prev) => ({
			...prev,
			[name]: updatedValue,
		}));

		validateField(name, updatedValue);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (Object.keys(errors).length > 0) {
			showAlert("Por favor Corregir los errores en el formulario", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
			return;
		}

		try {
			await catProductoService.crearCategoria(formData);
			showAlert("La Categoria ha sido guardada correctamente.",{
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/categoriaproducto");
			});
		} catch (error) {
			console.error("Error al agregar la categoria de producto:", error);
			showAlert("Error al agregar la categoria de producto", {
				type: "error",
				title: "Error",
				duration: 2000,
			})
		}
	};

	const handleCancel = () => {
		window.showAlert( "Si cancelas, perderás los datos ingresados.",{
			title: "¿Estás seguro?",
			type: "warning",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "Continuar Registrando"
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/categoriaproducto");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Categoria de Producto
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
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
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Descripción</h3>
					<input
						type="text"
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						maxLength={100}
						className="w-full border border-gray-300 p-2 rounded"
					/>
						{errors.Descripcion && (
							<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
						)}
				</div>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2 flex items-center">
					<h3 className="text-2xl text-black font-bold mb-2">Es Ropa?</h3>
					<input
						type="checkbox"
						name="Es_Ropa"
						checked={formData.Es_Ropa}
						onChange={handleChange}
						className="border border-gray-300 p-2 rounded"
						id="esRopa"
					/>
				</div>

				<div className="flex justify-end gap-4 md:col-span-2 px-7 mb-5">
					<Button type="submit" className="green" disabled={Object.keys(errors).length > 0}>
						<div className="flex items-center gap-2">
							<FaSave />
							Guardar
						</div>
					</Button>

					<Button type="button" className="red" onClick={handleCancel}>
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

export default AgregarCatProducto;
