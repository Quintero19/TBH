import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { rolService } from "../../../../service/roles.service";

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
				console.error("Error al cargar Rol:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo cargar el Rol",
					icon: "error",
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

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			await rolService.actualizarRoles(id, formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "El rol ha sido actualizado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/roles");
			});
		} catch (error) {
			console.error("Error al actualizar rol:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo actualizar el rol.",
				icon: "error",
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
};

export default EditarRol;
