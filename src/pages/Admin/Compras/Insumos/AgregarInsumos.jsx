import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import { insumoService } from "@/service/insumo.service";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AgregarInsumo = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Nombre: "",
		Stock: 0,
		Id_Categoria_Insumos: "",
		Estado: true,
	});

	const [categorias, setCategorias] = useState([]);
	const [errors, setErrors] = useState({});

	// --- Cargar categorías ---
	useEffect(() => {
		const fetchCategorias = async () => {
			try {
				const res = await categoriaInsumoService.obtenerCategorias();
				setCategorias(res.data);
			} catch (err) {
				console.error("Error al cargar categorías:", err);
				showAlert("Error al cargar categorías", { type: "error" });
			}
		};

		fetchCategorias();
	}, []);

	// --- Validar formulario ---
	const validateForm = () => {
		const newErrors = {};
		const { Nombre, Id_Categoria_Insumos } = formData;

		if (!Nombre.trim()) {
			newErrors.Nombre = "El nombre es obligatorio";
		} else if (Nombre.trim().length < 3) {
			newErrors.Nombre = "Mínimo 3 caracteres";
		}

		if (!Id_Categoria_Insumos) {
			newErrors.Id_Categoria_Insumos = "Debe seleccionar una categoría";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// --- Manejo de cambios ---
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// --- Guardar insumo ---
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			showAlert("Corrige los errores antes de guardar", {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		try {
			await insumoService.crearInsumo(formData);
			await showAlert("El insumo fue creado exitosamente", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/insumo");
		} catch (err) {
			console.error(err);
			showAlert(`Error al guardar: ${err.message}`, {
				type: "error",
				title: "Error",
			});
		}
	};

	// --- Cancelar ---
	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			type: "warning",
			title: "¿Cancelar?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((r) => r.isConfirmed && navigate("/admin/insumo"));
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Insumo
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
			>
				{/* Nombre */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1">
					<h3 className="text-2xl text-black font-bold mb-2">
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

				{/* Categoría */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1">
					<h3 className="text-2xl text-black font-bold mb-2">
						Categoría de Insumo <span className="text-red-500">*</span>
					</h3>
					<select
						name="Id_Categoria_Insumos"
						value={formData.Id_Categoria_Insumos}
						onChange={handleChange}
						className="w-full border border-gray-300 p-2 rounded"
					>
						<option value="">-- Selecciona una categoría --</option>
						{categorias.map((cat) => (
							<option
								key={cat.Id_Categoria_Insumos}
								value={cat.Id_Categoria_Insumos}
							>
								{cat.Nombre}
							</option>
						))}
					</select>
					{errors.Id_Categoria_Insumos && (
						<p className="text-red-500 text-sm mt-1">
							{errors.Id_Categoria_Insumos}
						</p>
					)}
				</div>

				{/* Botones */}
				<div className="md:col-span-2 flex gap-4">
					<Button icon="fa-floppy-o" className="green" type="submit">
						Guardar
					</Button>
					<Button icon="fa-times" className="red" onClick={handleCancel}>
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};

export default AgregarInsumo;
