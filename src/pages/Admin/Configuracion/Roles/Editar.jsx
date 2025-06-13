import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";

const EditarRol = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true,
	});

	useEffect(() => {
		const cargarRol = async () => {
			try {
				const data = await rolService.listarRolesId(id);
				setFormData(data.data);
			} catch (error) {
				console.error(error);
				showAlert("Error al cargar Rol:", {
					title: "Error",
					text: "No se pudo cargar el Rol",
				});
				navigate("/admin/roles");
			}
		};

		cargarRol();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const validarCampos = () => {
		const soloLetrasEspacios = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
		const { Nombre, Descripcion } = formData;

		if (Nombre.length < 5 || Nombre.length > 30) {
			showAlert("El nombre debe tener entre 5 y 30 caracteres.", {
				type: "error",
				title: "Validación",
			});
			return false;
		}

		if (!soloLetrasEspacios.test(Nombre)) {
			showAlert("El nombre solo debe contener letras y espacios.", {
				type: "error",
				title: "Validación",
			});
			return false;
		}

		if (!soloLetrasEspacios.test(Descripcion)) {
			showAlert("La descripción solo debe contener letras y espacios.", {
				type: "error",
				title: "Validación",
			});
			return false;
		}

		if (Nombre.startsWith(" ") || Descripcion.startsWith(" ")) {
			showAlert("Los campos no deben comenzar con un espacio.", {
				type: "error",
				title: "Validación",
			});
			return false;
		}

		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validarCampos()) return;

		try {
			await rolService.actualizarRoles(id, formData);
			showAlert("El rol ha sido actualizado correctamente.", {
				type: "success",
				duration: 1500,
			});
			navigate("/admin/roles");
		} catch (error) {
			console.error(error);
			showAlert("Error al actualizar rol:", {
				title: "Error",
				text: "No se pudo actualizar el rol.",
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
				navigate("/admin/roles");
			}
		});
	};

	return (
		<div className="flex">
			<div className="grow p-6">
				<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
					Editar Roles
				</h1>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Nombre <span className="text-red-500">*</span>
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
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Descripcion <span className="text-red-500">*</span>
						</h3>
						<input
							type="text"
							name="Descripcion"
							value={formData.Descripcion}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							required
						/>
					</div>

					<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Estado <span className="text-red-500">*</span>
						</h3>
						<select
							name="Estado"
							value={formData.Estado}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							required
						>
							<option value="">Selecciona estado</option>
							<option value={true}>Activo</option>
							<option value={false}>Inactivo</option>
						</select>
					</div>

					<div className="md:col-span-2 flex gap-2 ml-7">
						<Button  icon="fa-floppy-o" className="green" type="submit">
							Guardar
						</Button>
						<Button icon="fa-times" className="red" onClick={handleCancel}>
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditarRol;
