import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { clienteService } from "@/service/clientes.service";

const EditarCliente = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState(null);

	useEffect(() => {
		const cargarCliente = async () => {
			if (!id) {
				showAlert("ID de cliente no proporcionado.", {
					type: "error",
					title: "Datos inválidos",
					duration: 2000,
				});
				navigate("/admin/clientes");
				return;
			}

			try {
				const { data } = await clienteService.listarClientePorId(id);

				setFormData({
					Id_Cliente: data.Id_Cliente,
					TipoDocumento: data.Tipo_Documento,
					Documento: data.Documento,
					Nombre: data.Nombre,
					Correo: data.Correo,
					Celular: data.Celular,
					Direccion: data.Direccion,
					FechaNacimiento: data.F_Nacimiento,
					Estado: data.Estado,
				});
			} catch (error) {
				console.error("Error al cargar datos del cliente:", error);
				const errorMessage =
					error.response?.data?.message || "No se pudo cargar el cliente.";
				showAlert(errorMessage, {
					type: "error",
					title: "Error de Carga",
					duration: 2000,
				});
				navigate("/admin/clientes");
			}
		};

		cargarCliente();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		let val = value;

		setFormData({
			...formData,
			[name]: val,
		});
	};

	const validarFormulario = async () => {
		if (
			!formData.TipoDocumento ||
			!formData.Documento ||
			!formData.Nombre ||
			!formData.Correo ||
			!formData.Celular ||
			!formData.Direccion ||
			!formData.FechaNacimiento
		) {
			return "Todos los campos obligatorios deben ser proporcionados.";
		}

		if (formData.Documento.length < 5 || formData.Documento.length > 15) {
			return "El documento debe tener entre 5 y 15 dígitos.";
		}

		const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!correoRegex.test(formData.Correo)) {
			return "El correo ingresado no es válido.";
		}

		try {
			const response = await clienteService.listarClientes();
			const clientes = response.data;

			const existeDocumento = clientes.some(
				(c) =>
					c.Documento?.toString() === formData.Documento.toString() &&
					c.Id_Cliente !== formData.Id_Cliente,
			);
			if (existeDocumento) {
				return "El documento ya está registrado por otro cliente.";
			}

			const existeCorreo = clientes.some(
				(c) =>
					c.Correo?.toLowerCase() === formData.Correo.toLowerCase() &&
					c.Id_Cliente !== formData.Id_Cliente,
			);
			if (existeCorreo) {
				return "El correo ya está registrado por otro cliente.";
			}
		} catch (error) {
			console.error("Error al verificar unicidad de clientes:", error);
		}

		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const error = await validarFormulario();
		if (error) {
			showAlert(error, {
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		try {
			const dataToSend = {
				...formData,
				Tipo_Documento: formData.TipoDocumento,
				F_Nacimiento: formData.FechaNacimiento,
			};

			delete dataToSend.TipoDocumento;
			delete dataToSend.FechaNacimiento;
			delete dataToSend.Id_Cliente;

			await clienteService.actualizarCliente(id, dataToSend);

			showAlert("El cliente ha sido actualizado correctamente.", {
				type: "success",
				duration: 1500,
			}).then(() => {
				navigate("/admin/clientes");
			});
		} catch (error) {
			console.error("Error al guardar cliente:", error);
			const errorMessage =
				error.response?.data?.message ||
				"Ocurrió un error al actualizar el cliente.";
			showAlert(errorMessage, {
				type: "error",
				title: "Error",
			});
		}
	};

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los cambios realizados.", {
			type: "warning",
			title: "¿Cancelar?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, salir",
			cancelButtonText: "No, continuar",
		}).then((result) => {
			if (result.isConfirmed) {
				navigate("/admin/clientes");
			}
		});
	};

	if (!formData)
		return <p className="text-center mt-10 text-xl">Cargando cliente...</p>;

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Cliente
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Tipo de Documento
					</h3>
					<select
						name="TipoDocumento"
						value={formData.TipoDocumento}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
					>
						<option value="">Selecciona tipo</option>
						<option value="T.I">T.I</option>
						<option value="C.C">C.C</option>
					</select>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Documento
					</h3>
					<input
						type="number"
						name="Documento"
						value={formData.Documento}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
						maxLength={15}
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-1">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Nombre(s) y Apellidos
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">Correo</h3>
					<input
						type="email"
						name="Correo"
						value={formData.Correo}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">Celular</h3>
					<input
						type="number"
						name="Celular"
						value={formData.Celular}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Dirección
					</h3>
					<input
						type="text"
						name="Direccion"
						value={formData.Direccion}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Fecha de Nacimiento
					</h3>
					<input
						type="date"
						name="FechaNacimiento"
						value={formData.FechaNacimiento}
						onChange={handleChange}
						className="w-full p-2 border rounded"
						required
					/>
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button icon="fa-floppy-o" type="submit" className="green">
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

export default EditarCliente;
