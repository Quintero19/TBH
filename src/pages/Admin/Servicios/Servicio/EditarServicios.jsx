import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { servicioService } from "../../../../service/serviciosService";
import { empleadoService } from "../../../../service/empleado.service";

const EditarServicios = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});
	const [imagenesExistentes, setImagenesExistentes] = useState([]);
	const [imagenesNuevas, setImagenesNuevas] = useState([]);
	const [imagenesEliminadas, setImagenesEliminadas] = useState([]);
	const [empleadosActivos, setEmpleadosActivos] = useState([]);
	const maxImagenes = 3;

	const [formData, setFormData] = useState({
		Nombre: "",
		Precio: "",
		Duracion: "",
		Descripcion: "",
		empleados: [], // array de IDs de empleados seleccionados
	});

	useEffect(() => {
		const cargarServicio = async () => {
			try {
				console.log("Cargando servicio con ID:", id);
				const response = await servicioService.obtenerServicioPorId(id);
				console.log("Respuesta completa del servicio:", response);

				// Verificar que la respuesta tenga la estructura esperada
				if (!response || !response.data) {
					console.error("Respuesta inválida:", response);
					throw new Error("Respuesta del servidor inválida");
				}

				const servicioData = response.data;
				console.log("Datos del servicio procesados:", servicioData);

				// Cargar datos básicos del servicio
				setFormData({
					Nombre: servicioData.Nombre || "",
					Precio: servicioData.Precio || "",
					Duracion: servicioData.Duracion || "",
					Descripcion: servicioData.Descripcion || "",
					empleados: servicioData.empleados || [],
				});

				// Cargar imágenes existentes - las imágenes vienen en servicioData.Imagenes
				if (servicioData.Imagenes && Array.isArray(servicioData.Imagenes)) {
					console.log("Imágenes encontradas:", servicioData.Imagenes);
					setImagenesExistentes(servicioData.Imagenes);
				} else {
					console.log("No se encontraron imágenes en el servicio");
					setImagenesExistentes([]);
				}
			} catch (error) {
				console.error("Error al cargar servicio:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo cargar el servicio",
					icon: "error",
					background: "#000",
					color: "#fff",
				});
				navigate("/admin/servicios");
			}
		};

		const fetchEmpleados = async () => {
			try {
				console.log("Cargando empleados activos...");
				const empleados = await empleadoService.obtenerEmpleadosActivos();
				console.log("Empleados cargados:", empleados);
				setEmpleadosActivos(empleados);
			} catch (error) {
				console.error("Error cargando empleados activos:", error);
			}
		};

		cargarServicio();
		fetchEmpleados();
	}, [id, navigate]);

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre": {
				const regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

				if (value.trim().length === 0) {
					newErrors[name] = "El nombre es requerido";
				} else if (!regex.test(value)) {
					newErrors[name] = "No se permiten números ni caracteres especiales";
				} else if (value.trim().length < 3) {
					newErrors[name] = "Debe tener al menos 3 caracteres";
				} else if (value.trim().length > 30) {
					newErrors[name] = "No puede exceder los 30 caracteres";
				} else {
					delete newErrors[name];
				}
				break;
			}

			case "Precio":
				if (value.trim().length === 0) {
					newErrors[name] = "El precio es requerido";
				} else if (/[eE]/.test(value)) {
					newErrors[name] = "No se permite la notación científica (e)";
				} else if (Number.isNaN(Number(value)) || Number(value) <= 0) {
					newErrors[name] = "Debe ser un número mayor a 0";
				} else {
					delete newErrors[name];
				}
				break;

			case "Duracion": {
				const isValid =
					/^[0-9]+$/.test(value) &&
					Number.parseInt(value) > 0 &&
					Number.parseInt(value) <= 120;

				if (value.trim().length === 0) {
					newErrors[name] = "La duración es requerida";
				} else if (!isValid) {
					newErrors[name] =
						"Debe ser un número entero entre 1 y 120 minutos (2 horas)";
				} else {
					delete newErrors[name];
				}
				break;
			}

			case "Descripcion":
				if (value.trim().length === 0) {
					newErrors[name] = "La descripción es requerida";
				} else if (value.length < 5 || value.length > 150) {
					newErrors[name] = "Debe tener al menos 5 caracteres y máximo 150";
				} else {
					delete newErrors[name];
				}
				break;

			case "imagenes": {
				const totalImages = imagenesExistentes.length + imagenesNuevas.length;
				if (totalImages === 0) {
					newErrors[name] = "Debes subir al menos una imagen";
				} else {
					delete newErrors[name];
				}
				break;
			}

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

		// Special handling for numeric fields
		if (name === "Precio" || name === "Duracion") {
			if (value !== "" && Number.isNaN(value)) return;
		}

		const updatedValue = type === "checkbox" ? checked : value;
		setFormData((prev) => ({
			...prev,
			[name]: updatedValue,
		}));

		validateField(name, updatedValue);
	};

	// Manejar selección de empleados (checkboxes)
	const handleEmpleadoChange = (id) => {
		setFormData((prev) => {
			const empleadosSeleccionados = prev.empleados.includes(id)
				? prev.empleados.filter((empId) => empId !== id)
				: [...prev.empleados, id];
			return { ...prev, empleados: empleadosSeleccionados };
		});
	};

	// Manejar selección de imágenes nuevas
	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const totalImages = imagenesExistentes.length + imagenesNuevas.length;
		const availableSlots = maxImagenes - totalImages;
		const newImages = [...imagenesNuevas, ...files].slice(0, availableSlots);
		setImagenesNuevas(newImages);
		validateField("imagenes", [...imagenesExistentes, ...newImages]);
	};

	// Remover imagen nueva
	const removeNewImage = (index) => {
		const newImages = imagenesNuevas.filter((_, i) => i !== index);
		setImagenesNuevas(newImages);
		validateField("imagenes", [...imagenesExistentes, ...newImages]);
	};

	// Remover imagen existente
	const removeExistingImage = (index) => {
		const imageToRemove = imagenesExistentes[index];
		const newExistingImages = imagenesExistentes.filter((_, i) => i !== index);
		setImagenesExistentes(newExistingImages);
		setImagenesEliminadas([...imagenesEliminadas, imageToRemove]);
		validateField("imagenes", [...newExistingImages, ...imagenesNuevas]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate required fields
		const requiredFields = ["Nombre", "Precio", "Duracion", "Descripcion"];
		const missingFields = requiredFields.filter(
			(field) => !formData[field] || formData[field].toString().trim() === "",
		);

		// Validate images
		const totalImages = imagenesExistentes.length + imagenesNuevas.length;
		if (totalImages === 0) {
			setErrors(prev => ({ ...prev, imagenes: "Debes tener al menos una imagen" }));
		}

		if (missingFields.length > 0 || Object.keys(errors).length > 0 || totalImages === 0) {
			Swal.fire({
				title: "Error",
				text: "Por favor complete todos los campos obligatorios y corrija los errores",
				icon: "error",
				timer: 2000,
				background: "#000",
				color: "#fff",
			});
			return;
		}

		try {
			const formDataToSend = new FormData();

			// Campos de texto
			formDataToSend.append("Nombre", formData.Nombre);
			formDataToSend.append("Precio", formData.Precio);
			formDataToSend.append("Duracion", formData.Duracion);
			formDataToSend.append("Descripcion", formData.Descripcion);

			// Empleados (como JSON string para que backend los reciba como array)
			formDataToSend.append("empleados", JSON.stringify(formData.empleados));

			// Imágenes nuevas
			imagenesNuevas.forEach((img) => {
				formDataToSend.append("imagenes", img);
			});

			// Imágenes eliminadas
			if (imagenesEliminadas.length > 0) {
				formDataToSend.append("ImagenesEliminadas", JSON.stringify(imagenesEliminadas));
			}

			await servicioService.actualizarServicio(id, formDataToSend, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			Swal.fire({
				title: "¡Éxito!",
				text: "El servicio ha sido actualizado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/servicios");
			});
		} catch (error) {
			console.error("Error al actualizar servicio:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo actualizar el servicio.",
				icon: "error",
				background: "#000",
				color: "#fff",
			});
		}
	};

	const handleCancel = () => {
		Swal.fire({
			title: "¿Estás seguro?",
			text: "Si cancelas, perderás los cambios realizados.",
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
				navigate("/admin/servicios");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Servicio
			</h1>

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
						maxLength={50}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Nombre && (
						<p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Precio <span className="text-red-500">*</span>
					</h3>
					<input
						type="number"
						step="0.01"
						min="0"
						name="Precio"
						value={formData.Precio}
						onChange={(e) => {
							const value = e.target.value;
							const digitsOnly = value.replace(".", "");
							if (digitsOnly.length <= 6) {
								handleChange(e);
							}
						}}
						onKeyDown={(e) => {
							const allowedKeys = [
								"0",
								"1",
								"2",
								"3",
								"4",
								"5",
								"6",
								"7",
								"8",
								"9",
								".",
								"Backspace",
								"Tab",
								"Delete",
								"ArrowLeft",
								"ArrowRight",
							];
							if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
								e.preventDefault();
							}
							if (e.key === "." && e.target.value.includes(".")) {
								e.preventDefault();
							}
						}}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Precio && (
						<p className="text-red-500 text-sm mt-1">{errors.Precio}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Duración (min) <span className="text-red-500">*</span>
					</h3>
					<input
						type="number"
						name="Duracion"
						value={formData.Duracion}
						onChange={handleChange}
						min="1"
						max="120"
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Duracion && (
						<p className="text-red-500 text-sm mt-1">{errors.Duracion}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Descripción <span className="text-red-500">*</span>
					</h3>
					<textarea
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						maxLength={150}
						required
						className="w-full p-2 border border-gray-300 rounded"
						rows={3}
					/>
					<small className="text-gray-500 text-sm">
						{formData.Descripcion.length}/150 caracteres
					</small>
					{errors.Descripcion && (
						<p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
					)}
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Empleados disponibles
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
						{empleadosActivos.map((empleado) => (
							<label
								key={empleado.Id_Empleados}
								className="flex items-center space-x-2"
							>
								<input
									type="checkbox"
									checked={formData.empleados.includes(empleado.Id_Empleados)}
									onChange={() => handleEmpleadoChange(empleado.Id_Empleados)}
								/>
								<span>
									{empleado.Nombre} {empleado.Apellido ?? ""}
								</span>
							</label>
						))}
					</div>
				</div>

				{/* Imágenes */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Imágenes{" "}
						{errors.imagenes && <span className="text-red-500">*</span>}
					</h3>
					
					{/* Imágenes existentes */}
					{imagenesExistentes.length > 0 && (
						<div className="mb-4">
							<h4 className="text-lg font-semibold mb-2">Imágenes actuales:</h4>
							<div className="flex flex-wrap justify-start gap-4">
								{imagenesExistentes.map((imagen, idx) => (
									<div
										key={`existing-${idx}`}
										className="relative w-[200px] h-[200px] rounded overflow-hidden border shadow-md"
									>
										<img
											src={imagen.url || imagen.Url || imagen.imagen_url || imagen}
											alt={`imagen-existente-${idx}`}
											className="object-cover w-full h-full"
											onError={(e) => {
												console.error("Error cargando imagen:", imagen);
												e.target.style.display = 'none';
											}}
										/>
										<div className="absolute top-1 right-1 z-20">
											<Button
												onClick={() => removeExistingImage(idx)}
												className="red"
												icon="fa-times"
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Imágenes nuevas */}
					{imagenesNuevas.length > 0 && (
						<div className="mb-4">
							<h4 className="text-lg font-semibold mb-2">Imágenes nuevas:</h4>
							<div className="flex flex-wrap justify-start gap-4">
								{imagenesNuevas.map((file, idx) => (
									<div
										key={`new-${idx}`}
										className="relative w-[200px] h-[200px] rounded overflow-hidden border shadow-md"
									>
										<img
											src={URL.createObjectURL(file)}
											alt={`preview-${idx}`}
											className="object-cover w-full h-full"
										/>
										<div className="absolute top-1 right-1 z-20">
											<Button
												onClick={() => removeNewImage(idx)}
												className="red"
												icon="fa-times"
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{errors.imagenes && (
						<p className="text-red-500 text-sm mb-2">{errors.imagenes}</p>
					)}
					
					<div className="relative inline-block">
						<Button
							className="blue"
							icon="fa-upload"
							disabled={imagenesExistentes.length + imagenesNuevas.length >= maxImagenes}
						>
							<div className="flex items-center gap-2">
								Seleccionar Imágenes
							</div>
						</Button>
						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleImageChange}
							disabled={imagenesExistentes.length + imagenesNuevas.length >= maxImagenes}
							className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
						/>
					</div>
					<small className="text-gray-500 text-sm block mt-2">
						Máximo {maxImagenes} imágenes. Actualmente: {imagenesExistentes.length + imagenesNuevas.length}/{maxImagenes}
					</small>
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						type="submit"
						className="green"
						disabled={Object.keys(errors).length > 0 || (imagenesExistentes.length + imagenesNuevas.length) === 0}
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

export default EditarServicios;
