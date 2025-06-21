import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { catProductoService } from "@/service/categoriaProducto.service";
import { tallasService } from "@/service/tallas.service";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarTalla = () => {
	const [categorias, setCategorias] = useState([]);
	const { id } = useParams();
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});

	const [formData, setFormData] = useState({
		Id_Tallas: "",
		Nombre: "",
		Id_Categoria_Producto: "",
		Estado: true,
	});

	/* ───── Validaciones Formulario ───── */

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
				if (!value.trim()) {
					newErrors[name] = "El nombre es obligatorio";
				} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9\s]{1,25}$/.test(value)) {
					newErrors[name] =
						"Solo letras, números y espacios. Máximo 25 caracteres.";
				} else {
					delete newErrors[name];
				}
				break;
			case "Id_Categoria_Producto":
				if (!value) {
					newErrors[name] = "Debe seleccionar una categoría";
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
			const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9\s]*$/;
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

	/* ─────────────────────────────────── */
	
	/* ─────────── Cargar Datos ────────── */

	useEffect(() => {
		const cargarTalla = async () => {
			try {
				const data = await tallasService.obtenerTallaPorId(id);
				setFormData(data.data);
			} catch (error) {
				console.error("Error al cargar la talla:", error);
				showAlert("Error al cargar la Talla", {
					type: "error",
					title: "Error",
					duration: 2000,
				});
				navigate("/admin/tallas");
			}
		};

		const fetchCategorias = async () => {
			try {
				const response = await catProductoService.obtenerCategoriasRopa();
				setCategorias(response.data);
			} catch (error) {
				console.error("Error al obtener categorías:", error);
			}
		};

		fetchCategorias();
		cargarTalla();
	}, [id, navigate]);

	/* ─────────────────────────────────── */

	/* ──────── Boton de Guardar ───────── */

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
			await tallasService.actualizarTalla(id, formData);
			showAlert("La Talla ha sido actualizada correctamente.", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/tallas");
			});
		} catch (error) {
			console.error("Error al actualizar la talla:", error);
			showAlert("No se pudo actualizar la Talla", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ───────── Boton de Cancelar ─────────*/

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
					navigate("/admin/tallas");
				}
			});
	};

	/* ──────────────────────────────────── */

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">Editar Talla</h1>

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
					<h3 className="text-2xl text-black font-bold mb-2">
						Categoría de Producto <span className="text-red-500">*</span>
					</h3>
					<select
						name="Id_Categoria_Producto"
						value={formData.Id_Categoria_Producto}
						onChange={handleChange}
						required
						className="w-full border border-gray-300 p-2 rounded"
					>
						<option value="">Seleccione una categoría</option>
						{categorias.map((categoria) => (
							<option
								key={categoria.Id_Categoria_Producto}
								value={categoria.Id_Categoria_Producto}
							>
								{categoria.Nombre}
							</option>
						))}
					</select>
						{errors.Id_Categoria_Producto && (
							<p className="text-red-500 text-sm mt-1">{errors.Id_Categoria_Producto}</p>
						)}
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button type="submit" className="green" icon="fa-floppy-o" disabled={Object.keys(errors).length > 0}>
						Guardar
					</Button>

					<Button className="red" onClick={handleCancel} icon="fa-times">
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};

export default EditarTalla;
