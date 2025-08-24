import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";
import { userService } from "@/service/usuario.service";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function AgregarUsuario() {
	const navigate = useNavigate();
	const [roles, setRoles] = useState([]);
	const [mostrarPassword, setMostrarPassword] = useState(false);
	const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
	const [rolNombreSeleccionado, setRolNombreSeleccionado] = useState("");

	const [formData, setFormData] = useState({
		Documento: "",
		Correo: "",
		Password: "",
		confirmPassword: "",
		Rol_Id: "",
		Estado: true,

		//Campos Adicionales
		Tipo_Documento: "",
		Nombre: "",
		Celular: "",
		F_Nacimiento: "",
		Direccion: "",
		Sexo: "",
	});

	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const response = await rolService.listarRoles();
				const rolesActivos = response.data.filter((rol) => rol.Estado === true);
				setRoles(rolesActivos);
			} catch (error) {
				console.error("Error al obtener roles:", error);
			}
		};
		fetchRoles();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		let val = value;

		if (name === "Documento") {
			const regex = /^[0-9]*$/;
			if (!regex.test(value)) return;
		}

		if (name === "Estado") {
			val = value === "true";
		}

		if (name === "Rol_Id") {
			const id = Number(value);
			const rolSeleccionado = roles.find((r) => r.Id === id);
			setRolNombreSeleccionado(rolSeleccionado?.Nombre || "");
		}

		setFormData((prev) => ({ ...prev, [name]: val }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const { Documento, Correo, Password, confirmPassword, Rol_Id } = formData;

		if (!Documento.trim()) {
			return showAlert("Debe completar el campo documento.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (Documento.length < 7 || Documento.length > 15) {
			return showAlert("El documento debe tener entre 7 y 15 dígitos.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (!Correo.trim()) {
			return showAlert("Debe completar el campo correo.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!correoRegex.test(Correo)) {
			return showAlert("El correo ingresado no es válido.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (!Password.trim()) {
			return showAlert("Debe completar el campo contraseña.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (
			Password.length < 7 ||
			!/[0-9]/.test(Password)
		) {
			return showAlert(
				"La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un carácter especial.",
				{
					type: "error",
					title: "Datos inválidos",
				},
			);
		}

		if (!confirmPassword.trim()) {
			return showAlert("Debe confirmar la contraseña.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (Password !== confirmPassword) {
			return showAlert("Las contraseñas no coinciden.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (!Rol_Id) {
			return showAlert("Debe seleccionar un rol.", {
				type: "error",
				title: "Datos inválidos",
			});
		}

		if (["Cliente", "Empleado"].includes(rolNombreSeleccionado)) {
			const { Tipo_Documento, Nombre, Direccion, Celular, F_Nacimiento, Sexo } =
				formData;

			if (!Tipo_Documento.trim()) {
				return showAlert("Debe seleccionar el tipo de documento.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			if (!Nombre.trim()) {
				return showAlert("Debe ingresar el nombre completo.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			if (!Direccion.trim()) {
				return showAlert("Debe ingresar la dirección.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			if (!Celular.trim()) {
				return showAlert("Debe ingresar el número de celular.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			if (!/^\d{10}$/.test(Celular)) {
				return showAlert(
					"El número de celular debe tener exactamente 10 dígitos.",
					{ type: "error", title: "Datos inválidos" },
				);
			}

			if (!F_Nacimiento.trim()) {
				return showAlert("Debe ingresar la fecha de nacimiento.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			const fechaNacimiento = new Date(F_Nacimiento);
			if (isNaN(fechaNacimiento.getTime())) {
				return showAlert("La fecha de nacimiento no es válida.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			if (!Sexo.trim()) {
				return showAlert("Debe seleccionar el sexo.", {
					type: "error",
					title: "Datos inválidos",
				});
			}
		}

		try {
			const usuarios = await userService.listarUsuarios();

			const existeDocumento = usuarios.data.some(
				(u) => u.Documento.toString() === Documento.toString(),
			);
			if (existeDocumento) {
				return showAlert("El documento ya está registrado.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			const existeCorreo = usuarios.data.some(
				(u) => u.Correo.toLowerCase() === Correo.toLowerCase(),
			);
			if (existeCorreo) {
				return showAlert("El correo ya está registrado.", {
					type: "error",
					title: "Datos inválidos",
				});
			}

			const usuarioFinal = {
				...formData,
				Rol_Id: Number(Rol_Id),
			};
			delete usuarioFinal.confirmPassword;

			await userService.crearUsuario(usuarioFinal);

			showAlert("El usuario ha sido guardado correctamente.", {
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
		showAlert("Si cancelas, perderás los datos ingresados.", {
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

	return (
		<div className="flex">
			<div className="grow p-6">
				<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
					Agregar Usuario
				</h1>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Documento <span className="text-red-500">*</span>
						</h3>
						<input
							type="text"
							name="Documento"
							value={formData.Documento}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</div>

					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Correo <span className="text-red-500">*</span>
						</h3>
						<input
							type="text"
							name="Correo"
							value={formData.Correo}
							onChange={handleChange}
							className="w-full p-2 border rounded"
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
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Tipo de Documento <span className="text-red-500">*</span>
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

							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Nombre completo <span className="text-red-500">*</span>
								</h3>
								<input
									type="text"
									name="Nombre"
									value={formData.Nombre}
									onChange={handleChange}
									className="w-full p-2 border rounded"
								/>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Dirección <span className="text-red-500">*</span>
								</h3>
								<input
									type="text"
									name="Direccion"
									value={formData.Direccion}
									onChange={handleChange}
									className="w-full p-2 border rounded"
								/>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Celular <span className="text-red-500">*</span>
								</h3>
								<input
									type="number"
									name="Celular"
									value={formData.Celular}
									onChange={handleChange}
									className="w-full p-2 border rounded"
								/>
							</div>

							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Fecha de Nacimiento <span className="text-red-500">*</span>
								</h3>
								<input
									type="date"
									name="F_Nacimiento"
									value={formData.F_Nacimiento}
									onChange={handleChange}
									className="w-full p-2 border rounded"
								/>
							</div>

							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Sexo <span className="text-red-500">*</span>
								</h3>
								<select
									name="Sexo"
									value={formData.Sexo}
									onChange={handleChange}
									className="w-full p-2 border rounded"
								>
									<option value="">Selecciona</option>
									<option value="M">Masculino</option>
									<option value="F">Feminino</option>
								</select>
							</div>
						</>
					)}

					<div className="md:col-span-2 flex gap-2 ml-7">
						<Button icon="fa-floppy-o" className="green" type="submit">
							{" "}
							Guardar
						</Button>
						<Button icon="fa-times" className="red" onClick={handleCancel}>
							{" "}
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
