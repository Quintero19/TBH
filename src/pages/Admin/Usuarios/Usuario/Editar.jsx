import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { userService } from "../../../../service/usuario.service";

const EditarUsuario = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Documento: "",
		Correo: "",
		Id_Usuario: "",
		Rol_Id: "",
		Password: "",
    	confirmPassword: "",
		Estado: true
	});

	useEffect(() => {
		const cargarUsuario = async () => {
			try {
				const { data } = await userService.listarUsuarioPorId(id);
    			const { Password, ...resto } = data; 
				setFormData({
				...resto,
				Password: "",
				confirmPassword: ""
				});
			} catch (error) {
				console.error("Error al cargar usuario:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo cargar el usuario",
					icon: "error",
					background: "#000",
					color: "#fff"
				});
				navigate("/admin/usuario"); 
			}
		};

		cargarUsuario();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
			const usuarios = await userService.listarUsuarios();

			const existeDocumento = usuarios.data.some(
			(u) =>
				u.Documento.toString() === formData.Documento.toString() &&
				u.Id_Usuario !== formData.Id_Usuario
			);

			if (existeDocumento) {
			Swal.fire({
				title: "Error",
				text: "El documento ya está registrado por otro usuario.",
				icon: "error",
				background: "#000",
				color: "#fff"
			});
			return;
			}

			const existeCorreo = usuarios.data.some(
			(u) =>
				u.Correo.toLowerCase() === formData.Correo.toLowerCase() &&
				u.Id_Usuario !== formData.Id_Usuario
			);

			if (existeCorreo) {
			Swal.fire({
				title: "Error",
				text: "El correo ya está registrado por otro usuario.",
				icon: "error",
				background: "#000",
				color: "#fff"
			});
			return;
			}

			if (formData.Password || formData.confirmPassword) {
				if (formData.Password !== formData.confirmPassword) {
					Swal.fire({
					title: "Error",
					text: "Las contraseñas no coinciden.",
					icon: "error",
					background: '#000',
					color: '#fff'
					});
					return;
				}
				}
		
		const dataToSend = { ...formData };
			if (!formData.Password) {
			delete dataToSend.Password;
			}
			if (!formData.confirmPassword) {
			delete dataToSend.confirmPassword;
			}

			
		try {
			await userService.actualizarUsuario(id, dataToSend);
			Swal.fire({
				title: "¡Éxito!",
				text: "El usuario ha sido actualizado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff"
			}).then(() => {
				navigate("/admin/usuario");
			});
		} catch (error) {
			console.error("Error al actualizar usuario:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo actualizar el usuario.",
				icon: "error",
				background: "#000",
				color: "#fff"
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
				navigate("/admin/usuario"); 
			}
		});
	};

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
					<h3 className="text-2xl text-black font-bold mb-2">Correo Electrónico</h3>
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
          <h3 className="text-2xl text-black font-bold mb-2 block">Contraseña <span className="text-red-500">*</span></h3>
          <input
            type="password"
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">Confirmar Contraseña <span className="text-red-500">*</span></h3>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Rol</h3>
					<select
						name="Rol_Id"
						value={formData.Rol_Id}
						onChange={handleChange}
						required
						className="w-full border border-gray-300 p-2 rounded"
					>
						<option value="">Seleccione un rol</option>
						<option value={1}>Administrador</option>
						<option value={2}>Empleado</option>
						<option value={3}>Cliente</option>
					</select>
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button type="submit" className="green">
						Guardar
					</Button>

					<Button className="red" onClick={handleCancel}>
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};

export default EditarUsuario;
