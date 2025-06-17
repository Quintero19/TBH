import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { rolService } from "@/service/roles.service";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AgregarRol() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true,
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		let val = value;

		if (name === "Estado") {
			val = value === "true";
		}

		setFormData({
			...formData,
			[name]: val,
		});
	};

	const validarCampos = () => {
		const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
		const { Nombre, Descripcion } = formData;

		if (Nombre.length < 5 || Nombre.length > 30) {
			showAlert("El nombre debe tener entre 5 y 30 caracteres.", {
				type: "error",
				title: "Validación",
			});
			return false;
		}

		if (!nombreRegex.test(Nombre)) {
			showAlert("El nombre solo debe contener letras y espacios.", {
				type: "error",
				title: "Validación",
			});
			return false;
		}

		if (!nombreRegex.test(Descripcion)) {
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
			const nuevoRol = await rolService.crearRoles(formData);

			showAlert("El Rol ha sido guardado correctamente.", {
			type: "success",
			duration: 1500,
			}).then(() => {
			if (nuevoRol.data.Id) {
				navigate(`/admin/roles/asignar/${nuevoRol.data.Id}`);
			} else {
				navigate("/admin/roles"); 
			}
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
				navigate("/admin/roles");
			}
		});
	};

	return (
		<div className="flex">
			<div className="grow p-6">
				<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
					Agregar Roles
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

					<div className="md:col-span-2 flex gap-2 ml-7">
						<Button icon="fa-floppy-o" className="green" type="submit">
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
}
