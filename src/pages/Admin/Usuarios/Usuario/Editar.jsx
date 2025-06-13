import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";
import { userService } from "@/service/usuario.service";

const EditarUsuario = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState(null);
	const [roles, setRoles] = useState([]);

	useEffect(() => {
		const cargarUsuarioYRoles = async () => {
			if (!id) {
				showAlert("ID de usuario no proporcionado.",{
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
				setFormData({
					...resto,
					Password: "",
					confirmPassword: "",
				});

				const rolesData = await rolService.listarRoles();
				const rolesArray = rolesData.data;

				if (Array.isArray(rolesArray)) {
					const rolesActivos = rolesArray.filter((rol) => rol.Estado === true);
					setRoles(rolesActivos);
				} else {
					console.error("La propiedad data no es un array:", rolesArray);
				}
			} catch (error) {
				console.error("Error al cargar datos:", error);
				showAlert("No se pudo cargar el usuario o los roles.",{
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
			if (formData.Password.length < 8) {
				return "Las contraseñas debe ser minimo 8 caracteres.";
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

			showAlert("El usuario ha sido actualizado correctamente.",{
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
		showAlert("Si cancelas, perderás los cambios realizados.",{
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

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Contraseña</h3>
					<input
						type="password"
						name="Password"
						value={formData.Password}
						onChange={handleChange}
						className="w-full p-2 border rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Confirmar Contraseña
					</h3>
					<input
						type="password"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						className="w-full p-2 border rounded"
					/>
				</div>

				{/* Nuevo SELECT dinámico de roles */}
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
