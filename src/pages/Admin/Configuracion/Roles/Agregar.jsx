import React, { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { rolService } from "../../../../service/roles.service";

export default function AgregarRol() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Nombre: "",
		Descripcion: "",
		Estado: true
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

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await rolService.crearRoles(formData);

			Swal.fire({
				title: "¡Éxito!",
				text: "El Rol ha sido guardado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/roles");
			});
		} catch (error) {
			Swal.fire({
				title: "Error",
				text: error.message || "Ocurrió un error al guardar el rol.",
				icon: "error",
				confirmButtonText: "Aceptar",
				background: "#000",
				color: "#fff",
			});
		}
	};

	const handleCancel = () => {
		Swal.fire({
			title: "¿Estás seguro?",
			text: "Si cancelas, perderás los datos ingresados.",
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
						<Button className="green" type="submit">
							
							Guardar
						</Button>
						<Button className="red" onClick={handleCancel}>
							
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}