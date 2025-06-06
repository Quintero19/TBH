import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import Sidebar from "../../../../components/sideBar";
import { empleadoService } from "../../../../service/empleado.service";
import "../../../../../src/components/Buttons/Button";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const AgregarEmpleado = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Tipo_Documento: "",
		Documento: "",
		Nombre: "",
		Celular: "",
		F_Nacimiento: "",
		Direccion: "",
		Sexo: "",
		Estado: true,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!formData.Tipo_Documento ||
			!formData.Documento ||
			!formData.Nombre ||
			!formData.Celular ||
			!formData.F_Nacimiento ||
			!formData.Sexo
		) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Por favor, complete todos los campos obligatorios.",
				background: "#000",
				color: "#fff",
			});
			return;
		}

		try {
			await empleadoService.crearEmpleado(formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "El empleado ha sido guardado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/empleado");
			});
		} catch (error) {
			console.error("Error al agregar empleado:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Ocurrió un error al agregar el empleado.",
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
				navigate("/admin/empleado");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Empleado
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Tipo de Documento <span className="text-red-500">*</span>
					</h3>
					<select
						name="Tipo_Documento"
						value={formData.Tipo_Documento}
						onChange={handleChange}
						required
						className="w-full p-2 border rounded"
					>
						<option value="">Seleccione el Tipo</option>
						<option value="C.C">C.C - Cédula de Ciudadanía</option>
						<option value="T.E">T.E - Tarjeta de Identidad</option>
						<option value="C.E">C.E - Cédula de Extranjería</option>
						<option value="P.P">P.P - Pasaporte</option>
						<option value="PEP">PEP - Permiso Especial de Permanencia</option>
					</select>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Documento <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Documento"
						value={formData.Documento}
						onChange={handleChange}
						maxLength={20}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						maxLength={50}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Celular <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Celular"
						value={formData.Celular}
						onChange={(e) => {
							const value = e.target.value;
							if (!/^\d*$/.test(value)) return;
							if (value.length > 15) return;
							setFormData({ ...formData, Celular: value });
						}}
						maxLength={15}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Fecha de Nacimiento <span className="text-red-500">*</span>
					</h3>
					<input
						type="date"
						name="F_Nacimiento"
						value={formData.F_Nacimiento}
						onChange={handleChange}
						required
						className="w-full p-2 border border-gray-300 rounded"
						max={new Date().toISOString().split("T")[0]}
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Dirección</h3>
					<input
						type="text"
						name="Direccion"
						value={formData.Direccion}
						onChange={handleChange}
						maxLength={50}
						className="w-full p-2 border border-gray-300 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Sexo <span className="text-red-500">*</span>
					</h3>
					<select
						name="Sexo"
						value={formData.Sexo}
						onChange={handleChange}
						required
						className="w-full p-2 border rounded"
					>
						<option value="">Seleccione el Sexo</option>
						<option value="M">Masculino</option>
						<option value="F">Femenino</option>
					</select>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 flex items-center gap-3">
					<label className="text-xl font-semibold text-black">Estado</label>
					<input
						type="checkbox"
						name="Estado"
						checked={formData.Estado}
						onChange={handleChange}
						className="w-5 h-5"
					/>
				</div>

				<div className="flex justify-end gap-4 md:col-span-2 px-7 mb-5">
					<Button type="submit" className="green">
						<div className="flex items-center gap-2">
							<FaSave />
							Guardar
						</div>
					</Button>

					<Button type="button" className="red" onClick={handleCancel}>
						<div className="flex items-center gap-2">
							<IoClose />
							Cancelar
						</div>
					</Button>
				</div>
			</form>

			<Sidebar />
		</>
	);
};

export default AgregarEmpleado;
