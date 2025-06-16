import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { catProductoService } from "@/service/categoriaProducto.service";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarCatProducto = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Id_Categoria_Producto: "",
		Nombre: "",
		Descripcion: "",
		Es_Ropa: true,
		Estado: true,
	});

	useEffect(() => {
		const cargarCategoria = async () => {
			try {
				const data = await catProductoService.obtenerCategoriaPorId(id);
				setFormData(data.data);
			} catch (error) {
				console.error("Error al cargar la categoria:", error);
				showAlert("Error al cargar la categoria", {
					type: "error",
					title: "Error",
					duration: 2000,
				});
				navigate("/admin/categoriaproducto");
			}
		};

		cargarCategoria();
	}, [id, navigate]);

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
				if (!value.trim()) {
					newErrors[name] = "El nombre es obligatorio";
				} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,25}$/.test(value)) {
					newErrors[name] =
						"Solo letras y espacios. Entre 3 y 25 caracteres";
				} else {
					delete newErrors[name];
				}
				break;

			case "Descripcion":
				if (!value.trim()) {
					newErrors[name] = "La descripción es obligatoria";
				} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{7,100}$/.test(value)) {
					newErrors[name] = "Solo letras y espacios. Entre 7 y 100 caracteres";
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
			await catProductoService.actualizarCategoria(id, formData);
			showAlert("La Categoria ha sido actualizada correctamente.", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/categoriaproducto");
			});
		} catch (error) {
			console.error("Error al actualizar la categoria:", error);
			showAlert("No se pudo actualizar la categoria", {
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
					navigate("/admin/categoriaproducto");
				}
			});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Categoria Producto
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

export default EditarCatProducto;
