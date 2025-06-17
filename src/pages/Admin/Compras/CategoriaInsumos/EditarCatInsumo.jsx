import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { categoriaInsumoService } from "@/service/categoriaInsumo.service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarCatInsumo = () => {
	/**
	 * Inicialización de hooks useNavigate y useParams para navegación y obtener parámetro ID
	 */
	const navigate = useNavigate();
	const { id } = useParams();
	//-----------------------------

	/**
	 * Estado local para los datos del formulario (Nombre, Descripción, Estado)
	 * y para los errores de validación
	 */
	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true,
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(true);
	//-----------------------------

	/**
	 * Función para validar campos del formulario individualmente,
	 * recibe nombre del campo, valor, y errores actuales para actualizar
	 */
	const validateField = (name, value, currentErrors = {}) => {
		const newErrors = { ...currentErrors };
		const val = value.toString().trim();

		switch (name) {
			case "Nombre":
				if (!val) {
					newErrors.Nombre = "El nombre es obligatorio";
				} else if (val.length < 3) {
					newErrors.Nombre = "Mínimo 3 letras";
				} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(val)) {
					newErrors.Nombre = "Solo caracteres alfabéticos permitidos";
				} else {
					newErrors.Nombre = undefined;
				}
				break;

			case "Descripcion":
				if (!val) {
					newErrors.Descripcion = "La descripción es obligatoria";
				} else if (val.length < 5) {
					newErrors.Descripcion = "Mínimo 5 caracteres";
				} else if (val.length > 100) {
					newErrors.Descripcion = "Máximo 100 caracteres";
				} else {
					newErrors.Descripcion = undefined;
				}
				break;

			default:
				break;
		}

		return newErrors;
	};
	//-----------------------------

	/**
	 * useEffect que se ejecuta al montar el componente para cargar
	 * los datos de la categoría desde el backend por el ID
	 */
	useEffect(() => {
		const cargarCategoria = async () => {
			try {
				const response = await categoriaInsumoService.obtenerCategoriaPorId(id);
				const data = response.data;

				setFormData({
					Nombre: data.Nombre || "",
					Descripcion: data.Descripcion || "",
					Estado: data.Estado !== undefined ? data.Estado : true,
				});
				setLoading(false);
			} catch (err) {
				console.error(err);
				showAlert("No se pudo cargar la categoría", {
					type: "error",
					title: "Error",
				});
				navigate("/admin/categoriainsumo");
			}
		};

		cargarCategoria();
	}, [id, navigate]);
	//-----------------------------

	/**
	 * Maneja cambios en los inputs del formulario,
	 * actualiza el estado de formData y valida el campo modificado
	 */
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : value;

		setFormData((prev) => ({ ...prev, [name]: val }));

		setErrors((prevErrors) => validateField(name, val, prevErrors));
	};
	//-----------------------------

	/**
	 * Maneja el envío del formulario,
	 * valida todos los campos y si no hay errores,
	 * envía la actualización al backend y navega de regreso
	 */
	const handleSubmit = async (e) => {
		e.preventDefault();

		let newErrors = validateField("Nombre", formData.Nombre, {});
		newErrors = validateField("Descripcion", formData.Descripcion, newErrors);

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			showAlert("Corrige los errores antes de guardar", {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		try {
			await categoriaInsumoService.actualizarCategoria(id, formData);
			await showAlert("Categoría actualizada correctamente", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/categoriainsumo");
		} catch (err) {
			console.error(err);
			showAlert(`Error al guardar: ${err.message}`, {
				type: "error",
				title: "Error",
			});
		}
	};
	//-----------------------------

	/**
	 * Maneja la acción de cancelar la edición,
	 * muestra confirmación antes de navegar fuera del formulario
	 */
	const handleCancel = () => {
		showAlert("¿Estás seguro de cancelar los cambios?", {
			type: "warning",
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((r) => r.isConfirmed && navigate("/admin/categoriainsumo"));
	};
	//-----------------------------
	if (loading) {
		return (
			<p className="text-center text-gray-500 text-xl py-20">
				Cargando datos del insumo...
			</p>
		);
	}
	/**
	 * Render del componente
	 */
	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Categoría de Insumo
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
				noValidate
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg min-h-[120px]">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						required
						className={`w-full border p-2 rounded ${
							errors.Nombre ? "border-red-500" : "border-gray-300"
						}`}
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<textarea
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						required
						maxLength={100}
						className={`w-full border p-2 rounded ${
							errors.Descripcion ? "border-red-500" : "border-gray-300"
						}`}
						style={{ resize: "vertical" }}
					/>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
				</div>

				<input
					type="checkbox"
					name="Estado"
					checked={formData.Estado}
					disabled
					id="estado-checkbox"
					className="hidden"
				/>

				<div className="md:col-span-2 flex gap-4">
					<Button icon="fa fa-save" className="green" type="submit">
						Guardar Cambios
					</Button>
					<Button icon="fa fa-times" className="red" onClick={handleCancel}>
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};
//-----------------------------

export default EditarCatInsumo;
