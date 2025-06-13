import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";
import { userService } from "@/service/usuario.service";

export default function AgregarUsuario() {
	const navigate = useNavigate();

	const [roles, setRoles] = useState([]);

	const [formData, setFormData] = useState({
		Documento: "",
		Correo: "",
		Password: "",
		confirmPassword: "",
		Rol_Id: "",
		Estado: true,
	});

	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const response = await rolService.listarRoles();
				const rolesArray = response.data;

				if (Array.isArray(rolesArray)) {
					const rolesActivos = rolesArray.filter((rol) => rol.Estado === true);
					setRoles(rolesActivos);
				} else {
					console.error("La propiedad data no es un array:", rolesArray);
				}
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
		setFormData({
			...formData,
			[name]: val,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.Documento) {
			showAlert("Debe Completar el campo documento.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (formData.Documento.length < 7 || formData.Documento.length > 15) {
			showAlert("El documento debe tener entre 7 y 15 dígitos.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (!formData.Correo) {
			showAlert("Debe Completar el campo correo.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!correoRegex.test(formData.Correo)) {
			showAlert("El correo ingresado no es válido.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (!formData.Password) {
			showAlert("Debe Completar el campo contraseña.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (formData.Password.length < 8) {
			showAlert("La contraseña debe tener al menos 8 caracteres.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (!formData.confirmPassword) {
			showAlert("Debe Completar el campo confirmar contraseña.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (formData.Password !== formData.confirmPassword) {
			showAlert("Las contraseñas no coinciden.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		if (!formData.Rol_Id) {
			showAlert("Debe seleccionar un rol.",{
				type: "error",
				title: "Datos inválidos",
				duration: 2000,
			});
			return;
		}

		try {
			const usuarios = await userService.listarUsuarios();

			const existeDocumento = usuarios.data.some(
				(u) => u.Documento.toString() === formData.Documento.toString(),
			);
			if (existeDocumento) {
				showAlert("El documento ya está registrado.",{
					type: "error",
					title: "Datos inválidos",
					duration: 2000,
				});
				return;
			}

			const existeCorreo = usuarios.data.some(
				(u) => u.Correo.toLowerCase() === formData.Correo.toLowerCase(),
			);
			if (existeCorreo) {
				showAlert("El correo ya está registrado.",{
					type: "error",
					title: "Datos inválidos",
					duration: 2000,
				});
				return;
			}

			const usuarioFinal = {
				...formData,
				Rol_Id: Number(formData.Rol_Id),
			};
			usuarioFinal.confirmPassword = undefined;

			await userService.crearUsuario(usuarioFinal);

			showAlert("El usuario ha sido guardado correctamente.",{
				type: "success",
				duration: 1500,
			}).then(() => {
				navigate("/admin/usuario");
			});
		} catch (error) {
			console.error(err);
				showAlert(`Error al guardar: ${err.message}`, {
					type: "error",
					title: "Error",
				});
		}
	};

	const handleCancel = () => {
		showAlert( "Si cancelas, perderás los datos ingresados.",{
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
						<input
							type="password"
							name="Password"
							value={formData.Password}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</div>

					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Confirmar Contraseña <span className="text-red-500">*</span>
						</h3>
						<input
							type="password"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
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

					<div className="md:col-span-2 flex gap-2 ml-7">
						<Button className="green" type="submit">
							{" "}
							Guardar
						</Button>
						<Button className="red" onClick={handleCancel}>
							{" "}
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
