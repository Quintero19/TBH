import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";
import { userService } from "@/service/usuario.service";
import { clienteService } from "@/service/clientes.service";
import { empleadoService } from "@/service/empleado.service";

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const EditarUsuario = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [mostrarPassword, setMostrarPassword] = useState(false);
	const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
	const [rolNombreSeleccionado, setRolNombreSeleccionado] = useState("");

	const [formData, setFormData] = useState(null);
	const [roles, setRoles] = useState([]);

	useEffect(() => {
		const cargarUsuarioYRoles = async () => {
			if (!id) {
				showAlert("ID de usuario no proporcionado.", {
					type: "error",
					title: "Datos inválidos",
					duration: 2000,
				});
				navigate("/admin/usuario");
				return;
			}

			try {
				const { data } = await userService.listarUsuarioPorId(id);
				const { Password, ...resto } = data;

				
				const rolesData = await rolService.listarRoles();
				const rolesArray = rolesData.data;
				const rolesActivos = rolesArray.filter((rol) => rol.Estado === true);
				setRoles(rolesActivos);

				
				const rolEncontrado = rolesArray.find((r) => r.Id === data.Rol_Id);
				const nombreRol = rolEncontrado?.Nombre || "";
				setRolNombreSeleccionado(nombreRol);

				
				let datosFinales = {
					...resto,
					Password: "",
					confirmPassword: "",
				};

				
				if (["Cliente", "Empleado"].includes(nombreRol)) {
					try {
						const resultado =
							nombreRol === "Cliente"
								? await clienteService.listarClientePorDocumento(data.Documento)
								: await empleadoService.listarEmpleadoPorDocumento(
										data.Documento,
									);

						if (resultado?.data) {
							const infoExtra = resultado.data;
							datosFinales = {
								...datosFinales,
								Tipo_Documento: infoExtra.Tipo_Documento || "",
								Nombre: infoExtra.Nombre || "",
								Celular: infoExtra.Celular || "",
								F_Nacimiento: infoExtra.F_Nacimiento?.substring(0, 10) || "",
								Direccion: infoExtra.Direccion || "",
								Sexo: infoExtra.Sexo || "",
							};
						}
					} catch (errorExtra) {
						console.warn(
							"No se encontraron datos adicionales del cliente o empleado.",
							errorExtra,
						);
					}
				}

				setFormData(datosFinales);
			} catch (error) {
				console.error("Error al cargar datos:", error);
				showAlert("No se pudo cargar el usuario o los roles.", {
					type: "error",
					title: "Datos inválidos",
					duration: 2000,
				});
				navigate("/admin/usuario");
			}
		};

		cargarUsuarioYRoles();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (name === "Rol_Id") {
			const id = Number(value);
			const rolSeleccionado = roles.find((r) => r.Id === id);
			setRolNombreSeleccionado(rolSeleccionado?.Nombre || "");
		}

		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const validarFormulario = (usuarios) => {
		if (formData.Documento.length < 6) {
			return "El documento debe tener al menos 6 caracteres.";
		}

		const existeDocumento = usuarios.data.some(
			(u) =>
				u.Documento.toString() === formData.Documento.toString() &&
				u.Id_Usuario !== formData.Id_Usuario,
		);
		if (existeDocumento) {
			return "El documento ya está registrado por otro usuario.";
		}

		const existeCorreo = usuarios.data.some(
			(u) =>
				u.Correo.toLowerCase() === formData.Correo.toLowerCase() &&
				u.Id_Usuario !== formData.Id_Usuario,
		);
		if (existeCorreo) {
			return "El correo ya está registrado por otro usuario.";
		}

		if (formData.Password || formData.confirmPassword) {
			if (formData.Password !== formData.confirmPassword) {
				return "Las contraseñas no coinciden.";
			}
		}

		if (formData.Password || formData.confirmPassword) {
			const password = formData.Password;
			if (
				password.length < 8 ||
				!/[A-Z]/.test(password) ||
				!/[0-9]/.test(password) ||
				!/[!@#$%^&*(),.?":{}|<>]/.test(password)
			) {
				showAlert(
					"La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un carácter especial.",
					{
						type: "error",
						title: "Datos inválidos",
						duration: 2000,
					},
				);
				return;
			}
		}

		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const usuarios = await userService.listarUsuarios();
			const error = validarFormulario(usuarios);
			if (error) {
				showAlert({
					title: "Error",
					type: "error",
				});
				return;
			}

			const dataToSend = { ...formData };
			if (!formData.Password) dataToSend.Password = undefined;
			if (!formData.confirmPassword) dataToSend.confirmPassword = undefined;

			await userService.actualizarUsuario(id, dataToSend);

			showAlert("El usuario ha sido actualizado correctamente.", {
				type: "success",
				duration: 1500,
			}).then(() => {
				navigate("/admin/usuario");
			});
		} catch (err) {
			console.error(err);
			showAlert(`Error al guardar: ${err.message}`, {
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
				navigate("/admin/usuario");
			}
		});
	};

	if (!formData)
		return <p className="text-center mt-10 text-xl">Cargando usuario...</p>;

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Usuario
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Documento</h3>
					<input
						type="text"
						name="Documento"
						value={formData.Documento}
						onChange={handleChange}
						required
						maxLength={15}
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Correo Electrónico
					</h3>
					<input
						type="email"
						name="Correo"
						value={formData.Correo}
						onChange={handleChange}
						required
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Contraseña <span className="text-red-500">*</span>
					</h3>
					<div className="relative">
						<input
							type={mostrarPassword ? "text" : "password"}
							name="Password"
							value={formData.Password}
							onChange={handleChange}
							className="w-full p-2 border rounded pr-10"
						/>
						<button
							type="button"
							onClick={() => setMostrarPassword((prev) => !prev)}
							className="absolute right-2 top-2 text-gray-600"
						>
							<FontAwesomeIcon icon={mostrarPassword ? faEyeSlash : faEye} />
						</button>
					</div>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Confirmar Contraseña <span className="text-red-500">*</span>
					</h3>
					<div className="relative">
						<input
							type={mostrarConfirmPassword ? "text" : "password"}
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							className="w-full p-2 border rounded pr-10"
						/>
						<button
							type="button"
							onClick={() => setMostrarConfirmPassword((prev) => !prev)}
							className="absolute right-2 top-2 text-gray-600"
						>
							<FontAwesomeIcon
								icon={mostrarConfirmPassword ? faEyeSlash : faEye}
							/>
						</button>
					</div>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Rol <span className="text-red-500">*</span>
					</h3>
					<select
						name="Rol_Id"
						value={formData.Rol_Id}
						onChange={handleChange}
						className="w-full p-2 border rounded"
					>
						<option value="">Selecciona un rol</option>
						{Array.isArray(roles) &&
							roles.map((rol) => (
								<option key={rol.Id} value={rol.Id}>
									{rol.Nombre}
								</option>
							))}
					</select>
				</div>

				{["Cliente", "Empleado"].includes(rolNombreSeleccionado) && (
					<>
						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">
								Tipo de Documento
							</h3>
							<select
								name="Tipo_Documento"
								value={formData.Tipo_Documento}
								onChange={handleChange}
								className="w-full p-2 border rounded"
							>
								<option value="">Selecciona tipo</option>
								<option value="T.I">T.I</option>
								<option value="C.C">C.C</option>
								<option value="C.E">C.E</option>
							</select>
						</div>

						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">
								Nombre completo
							</h3>
							<input
								type="text"
								name="Nombre"
								value={formData.Nombre}
								onChange={handleChange}
								className="w-full p-2 border rounded"
							/>
						</div>

						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">Dirección</h3>
							<input
								type="text"
								name="Direccion"
								value={formData.Direccion}
								onChange={handleChange}
								className="w-full p-2 border rounded"
							/>
						</div>

						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">Celular</h3>
							<input
								type="text"
								name="Celular"
								value={formData.Celular}
								onChange={handleChange}
								className="w-full p-2 border rounded"
							/>
						</div>

						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">
								Fecha de nacimiento
							</h3>
							<input
								type="date"
								name="F_Nacimiento"
								value={formData.F_Nacimiento}
								onChange={handleChange}
								className="w-full p-2 border rounded"
							/>
						</div>

						<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
							<h3 className="text-2xl text-black font-bold mb-2">Sexo</h3>
							<select
								name="Sexo"
								value={formData.Sexo}
								onChange={handleChange}
								className="w-full p-2 border rounded"
							>
								<option value="">Selecciona</option>
								<option value="M">Masculino</option>
								<option value="F">Femenino</option>
							</select>
						</div>
					</>
				)}

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

export default EditarUsuario;
