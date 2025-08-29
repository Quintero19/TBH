import { showAlert } from "@/components/AlertProvider";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Buttons/Button";
import { empleadoService } from "@/service/empleado.service";
import { clienteService } from "@/service/clientes.service";
import { servicioService } from "@/service/serviciosservice";
import agendamientoService from "@/service/agendamientoService"; // Asegúrate de importar el servicio de agendamientos

const AgregarAgendamiento = () => {
	const navigate = useNavigate();
	const [errors, setErrors] = useState({});
	const [empleados, setEmpleados] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [servicios, setServicios] = useState([]);
	const [filteredClientes, setFilteredClientes] = useState([]);
	const [loadingEmpleados, setLoadingEmpleados] = useState(true);
	const [loadingClientes, setLoadingClientes] = useState(true);
	const [loadingServicios, setLoadingServicios] = useState(true);
	const [touched, setTouched] = useState({});
	const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
	const [clienteSearch, setClienteSearch] = useState("");

	const [formData, setFormData] = useState({
		Id_Agendamientos: "",
		Id_Cliente: "",
		Id_Empleados: "",
		Id_Servicios: "",
		Fecha: "",
		Hora: "",
		Subtotal: "",
		Estado: true, // Estado oculto 
	});


	const showEmptyFieldAlert = (fieldName) => {
		const fieldNames = {
			Id_Cliente: "cliente",
			Id_Empleados: "empleado",
			Id_Servicios: "servicio",
			Fecha: "fecha",
			Hora: "hora"
		};
		
		showAlert(`Por favor, complete el campo ${fieldNames[fieldName]}`, {
			type: "error",
			title: "Campo requerido",
		});
	};

	// Marcar campo como tocado
	const handleBlur = (e) => {
		const { name } = e.target;
		setTouched(prev => ({ ...prev, [name]: true }));
		validateField(name, formData[name]);
	};

	useEffect(() => {
		const fetchEmpleados = async () => {
			try {
				setLoadingEmpleados(true);
				const response = await empleadoService.obtenerEmpleadosActivos();

				let empleadosData = [];

				if (Array.isArray(response)) {
					empleadosData = response;
				} else if (response?.data && Array.isArray(response.data)) {
					empleadosData = response.data;
				} else if (response?.empleados && Array.isArray(response.empleados)) {
					empleadosData = response.empleados;
				}

				setEmpleados(empleadosData);

				if (empleadosData.length === 0) {
					showAlert("No se encontraron empleados activos", {
						type: "warning",
						title: "Advertencia",
					});
				}
			} catch (error) {
				console.error("Error al obtener empleados:", error);
				showAlert("Error al cargar la lista de empleados", {
					type: "error",
					title: "Error",
				});
				setEmpleados([]);
			} finally {
				setLoadingEmpleados(false);
			}
		};

		const fetchClientes = async () => {
			try {
				setLoadingClientes(true);
				const response = await clienteService.listarClientes();

				let clientesData = [];

				if (Array.isArray(response)) {
					clientesData = response;
				} else if (response?.data && Array.isArray(response.data)) {
					clientesData = response.data;
				} else if (response?.clientes && Array.isArray(response.clientes)) {
					clientesData = response.clientes;
				}

				// Filtrar clientes activos manualmente
				const clientesActivos = clientesData.filter(cliente => 
					cliente.Estado === true || 
					cliente.estado === true || 
					cliente.activo === true ||
					cliente.Estado === 'activo' ||
					cliente.estado === 'activo' ||
					cliente.Estado === 'ACTIVO' ||
					cliente.estado === 'ACTIVO' ||
					// Si no hay propiedad de estado, asumir que está activo
					cliente.Estado === undefined && cliente.estado === undefined && cliente.activo === undefined
				);

				setClientes(clientesActivos);
				setFilteredClientes(clientesActivos);

				if (clientesActivos.length === 0) {
					showAlert("No se encontraron clientes activos", {
						type: "warning",
						title: "Advertencia",
					});
				}
			} catch (error) {
				console.error("Error al obtener clientes:", error);
				showAlert("Error al cargar la lista de clientes", {
					type: "error",
					title: "Error",
				});
				setClientes([]);
				setFilteredClientes([]);
			} finally {
				setLoadingClientes(false);
			}
		};

		const fetchServicios = async () => {
			try {
				setLoadingServicios(true);
				// CORRECCIÓN: Usar obtenerServicios en lugar de obtenerServiciosActivos
				const response = await servicioService.obtenerServicios();

				let serviciosData = [];

				if (Array.isArray(response)) {
					serviciosData = response;
				} else if (response?.data && Array.isArray(response.data)) {
					serviciosData = response.data;
				} else if (response?.servicios && Array.isArray(response.servicios)) {
					serviciosData = response.servicios;
				}

				// FILTRAR SERVICIOS ACTIVOS MANUALMENTE
				const serviciosActivos = serviciosData.filter(servicio => 
					servicio.Estado === true || 
					servicio.estado === true || 
					servicio.activo === true ||
					servicio.Estado === 'activo' ||
					servicio.estado === 'activo' ||
					servicio.Estado === 'ACTIVO' ||
					servicio.estado === 'ACTIVO' ||
					// Si no hay propiedad de estado, asumir que está activo
					(servicio.Estado === undefined && servicio.estado === undefined && servicio.activo === undefined)
				);

				setServicios(serviciosActivos);

				if (serviciosActivos.length === 0) {
					showAlert("No se encontraron servicios activos", {
						type: "warning",
						title: "Advertencia",
					});
				}
			} catch (error) {
				console.error("Error al obtener servicios:", error);
				showAlert("Error al cargar la lista de servicios", {
					type: "error",
					title: "Error",
				});
				setServicios([]);
			} finally {
				setLoadingServicios(false);
			}
		};

		fetchEmpleados();
		fetchClientes();
		fetchServicios();
	}, []);

	// Filtrar clientes según la búsqueda
	useEffect(() => {
		if (clienteSearch.trim() === "") {
			setFilteredClientes(clientes);
		} else {
			const searchTerm = clienteSearch.toLowerCase();
			const filtered = clientes.filter(
				cliente =>
					cliente.Nombre.toLowerCase().includes(searchTerm) ||
					cliente.Documento.includes(searchTerm)
			);
			setFilteredClientes(filtered);
		}
	}, [clienteSearch, clientes]);

	// Validar que la hora esté entre 9:00 y 21:00 (9pm)
	const validateTime = (time) => {
		if (!time) return false;
		
		const [hours] = time.split(':').map(Number);
		return hours >= 9 && hours <= 21;
	};

	const isFormValid = () => {
		const requiredFields = ["Id_Cliente", "Id_Empleados", "Id_Servicios", "Fecha", "Hora"];
		const allFieldsFilled = requiredFields.every(
			(field) => formData[field] && formData[field].toString().trim() !== "",
		);
		const noErrors = Object.keys(errors).length === 0;
		return allFieldsFilled && noErrors;
	};

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Id_Cliente":
				if (!value) {
					newErrors[name] = "Este campo es requerido";
				} else {
					delete newErrors[name];
				}
				break;

			case "Id_Empleados":
				if (!value) {
					newErrors[name] = "Este campo es requerido";
				} else {
					delete newErrors[name];
				}
				break;

			case "Id_Servicios":
				if (!value) {
					newErrors[name] = "Este campo es requerido";
				} else {
					delete newErrors[name];
				}
				break;

			case "Fecha":
				if (!value) {
					newErrors[name] = "La fecha es requerida";
				} else {
					delete newErrors[name];
				}
				break;

			case "Hora":
				if (!value) {
					newErrors[name] = "La hora es requerida";
				} else if (!validateTime(value)) {
					newErrors[name] = "La hora debe estar entre 9:00 am y 9:00 pm";
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

		setFormData((prev) => {
			const newFormData = {
				...prev,
				[name]: updatedValue,
			};

			// Si se selecciona un servicio, actualizar el subtotal automáticamente
			if (name === "Id_Servicios" && value) {
				const servicioSeleccionado = servicios.find(servicio => servicio.Id_Servicios.toString() === value);
				if (servicioSeleccionado) {
					newFormData.Subtotal = servicioSeleccionado.Precio || "0";
				}
			}

			return newFormData;
		});

		validateField(name, updatedValue);
	};

	// Manejar selección de cliente
	const handleClienteSelect = (cliente) => {
		setFormData(prev => ({
			...prev,
			Id_Cliente: cliente.Id_Cliente
		}));
		setClienteSearch(`${cliente.Nombre} - ${cliente.Documento}`);
		setShowClienteSuggestions(false);
		setTouched(prev => ({ ...prev, Id_Cliente: true }));
		validateField("Id_Cliente", cliente.Id_Cliente);
	};

	// Manejar búsqueda de cliente
	const handleClienteSearchChange = (e) => {
		const value = e.target.value;
		setClienteSearch(value);
		setShowClienteSuggestions(true);
		
		// Si se borra el campo, limpiar la selección
		if (value === "") {
			setFormData(prev => ({
				...prev,
				Id_Cliente: ""
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Marcar todos los campos como tocados para mostrar errores
		const allFields = ["Id_Cliente", "Id_Empleados", "Id_Servicios", "Fecha", "Hora"];
		const newTouched = {};
		allFields.forEach(field => {
			newTouched[field] = true;
		});
		setTouched(newTouched);

		// Validar todos los campos
		let hasEmptyFields = false;
		allFields.forEach((field) => {
			validateField(field, formData[field]);
			if (!formData[field]) {
				hasEmptyFields = true;
				showEmptyFieldAlert(field);
			}
		});

		if (Object.keys(errors).length > 0 || hasEmptyFields) {
			showAlert("Por favor, complete todos los campos requeridos", {
				type: "error",
				title: "Campos incompletos",
			});
			return;
		}

		try {
			// Combinar fecha y hora en un solo campo datetime
			const fechaCompleta = `${formData.Fecha}T${formData.Hora}:00`;
			
			const payload = {
				...formData,
				Fecha: fechaCompleta,
				Subtotal: Number.parseFloat(formData.Subtotal),
			};

			await agendamientoService.crearAgendamiento(payload);
			showAlert("El agendamiento ha sido guardado correctamente.", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => {
				navigate("/admin/agendamientos");
			});
		} catch (error) {
			console.error("Error al agregar agendamiento:", error);
			showAlert("Error al agregar agendamiento", {
				type: "error",
				title: "Error",
				duration: 2000,
			});
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			title: "¿Estás seguro?",
			type: "warning",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "Continuar",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/agendamientos");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Agendamiento
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				{/* Cliente - Búsqueda con autocompletado */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 relative">
					<h3 className="text-2xl text-black font-bold mb-2">
						Cliente <span className="text-red-500">*</span>
					</h3>
					{loadingClientes ? (
						<div className="animate-pulse p-3 bg-gray-200 rounded-lg">
							Cargando clientes...
						</div>
					) : (
						<div className="relative">
							<input
								type="text"
								value={clienteSearch}
								onChange={handleClienteSearchChange}
								onFocus={() => setShowClienteSuggestions(true)}
								onBlur={() => setTimeout(() => setShowClienteSuggestions(false), 200)}
								placeholder="Buscar por nombre o documento..."
								className={`w-full p-2 border ${(errors.Id_Cliente && touched.Id_Cliente) ? "border-red-500" : "border-gray-300"} rounded`}
								required
							/>
							{errors.Id_Cliente && touched.Id_Cliente && (
								<p className="text-red-500 text-sm mt-1">
									{errors.Id_Cliente}
								</p>
							)}
							
							{showClienteSuggestions && filteredClientes.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
									{filteredClientes.map((cliente) => (
										<div
											key={cliente.Id_Cliente}
											className="p-2 hover:bg-gray-100 cursor-pointer"
											onMouseDown={() => handleClienteSelect(cliente)}
										>
											<div className="font-medium">{cliente.Nombre}</div>
											<div className="text-sm text-gray-600">Documento: {cliente.Documento}</div>
										</div>
									))}
								</div>
							)}
							
							{showClienteSuggestions && filteredClientes.length === 0 && clienteSearch.trim() !== "" && (
								<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
									<div className="p-2 text-gray-500">No se encontraron clientes</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Empleado */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Empleado <span className="text-red-500">*</span>
					</h3>
					{loadingEmpleados ? (
						<div className="animate-pulse p-3 bg-gray-200 rounded-lg">
							Cargando empleados...
						</div>
					) : (
						<>
							<select
								name="Id_Empleados"
								value={formData.Id_Empleados}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full p-2 border ${(errors.Id_Empleados && touched.Id_Empleados) ? "border-red-500" : "border-gray-300"} rounded`}
								required
								disabled={empleados.length === 0}
							>
								<option value="">Seleccione un empleado...</option>
								{empleados.map((empleado) => (
									<option
										key={empleado.Id_Empleados}
										value={empleado.Id_Empleados}
									>
										{empleado.Nombre} - {empleado.Documento}
									</option>
								))}
							</select>
							{errors.Id_Empleados && touched.Id_Empleados && (
								<p className="text-red-500 text-sm mt-1">
									{errors.Id_Empleados}
								</p>
							)}
						</>
					)}
				</div>

				{/* Servicio */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Servicio <span className="text-red-500">*</span>
					</h3>
					{loadingServicios ? (
						<div className="animate-pulse p-3 bg-gray-200 rounded-lg">
							Cargando servicios...
						</div>
					) : (
						<>
							<select
								name="Id_Servicios"
								value={formData.Id_Servicios}
								onChange={handleChange}
								onBlur={handleBlur}
								className={`w-full p-2 border ${(errors.Id_Servicios && touched.Id_Servicios) ? "border-red-500" : "border-gray-300"} rounded`}
								required
								disabled={servicios.length === 0}
							>
								<option value="">Seleccione un servicio...</option>
								{servicios.map((servicio) => (
									<option
										key={servicio.Id_Servicios}
										value={servicio.Id_Servicios}
									>
										{servicio.Nombre} - ${servicio.Precio}
									</option>
								))}
							</select>
							{errors.Id_Servicios && touched.Id_Servicios && (
								<p className="text-red-500 text-sm mt-1">
									{errors.Id_Servicios}
								</p>
							)}
						</>
					)}
				</div>

				{/* Fecha */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Fecha <span className="text-red-500">*</span>
					</h3>
					<input
						type="date"
						name="Fecha"
						value={formData.Fecha}
						onChange={handleChange}
						onBlur={handleBlur}
						className={`w-full p-2 border ${(errors.Fecha && touched.Fecha) ? "border-red-500" : "border-gray-300"} rounded`}
						min={new Date().toISOString().split("T")[0]}
						required
					/>
					{errors.Fecha && touched.Fecha && (
						<p className="text-red-500 text-sm mt-1">{errors.Fecha}</p>
					)}
				</div>

				{/* Hora - Input tipo reloj */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Hora <span className="text-red-500">*</span>
					</h3>
					<input
						type="time"
						name="Hora"
						value={formData.Hora}
						onChange={handleChange}
						onBlur={handleBlur}
						min="09:00"
						max="21:00"
						className={`w-full p-2 border ${(errors.Hora && touched.Hora) ? "border-red-500" : "border-gray-300"} rounded`}
						required
					/>
					{errors.Hora && touched.Hora && (
						<p className="text-red-500 text-sm mt-1">{errors.Hora}</p>
					)}
					<p className="text-sm text-gray-500 mt-1">
						Horario disponible: 9:00 am - 9:00 pm
					</p>
				</div>

				{/* Subtotal (automático) */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Subtotal
					</h3>
					<div className="flex items-center">
						<span className="text-2xl font-bold text-green-600">
							${formData.Subtotal || "0"}
						</span>
						<span className="ml-2 text-gray-500 text-sm">
							(Calculado automáticamente según el servicio seleccionado)
						</span>
					</div>
				</div>

				{/* Estado - OCULTO pero presente en el formulario */}
				<input type="hidden" name="Estado" value={formData.Estado} />

				{/* Botones */}
				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						type="submit"
						className="green"
						disabled={!isFormValid()}
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

export default AgregarAgendamiento;