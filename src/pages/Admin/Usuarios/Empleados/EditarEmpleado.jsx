import React, { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import Sidebar from "../../../../components/sideBar";
import { empleadoService } from "../../../../service/empleado.service";

const EditarEmpleado = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Id_Empleados: "",
		Documento: "",
		Nombre: "",
		Celular: "",
		F_Nacimiento: "",
		Direccion: "",
		Sexo: "",
	});

	useEffect(() => {
		const cargarEmpleado = async () => {
			try {
				const data = await empleadoService.obtenerEmpleadoPorId(id);
				const empleadoData = data.data;
				if (empleadoData.F_Nacimiento) {
					empleadoData.F_Nacimiento = empleadoData.F_Nacimiento.split("T")[0];
				}
				setFormData(empleadoData);
			} catch (error) {
				console.error("Error al cargar empleado:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo cargar el empleado",
					icon: "error",
					background: "#000",
					color: "#fff",
				});
				navigate("/admin/empleado");
			}
		};

		cargarEmpleado();
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
			await empleadoService.actualizarEmpleado(id, formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "El empleado ha sido actualizado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/empleado");
			});
		} catch (error) {
			console.error("Error al actualizar empleado:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo actualizar el empleado.",
				icon: "error",
				background: "#000",
				color: "#fff",
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
				navigate("/admin/empleado");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Empleado
			</h1>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6"
			>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 md:col-span-1">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Documento
					</h3>
					<input
						type="text"
						name="Documento"
						value={formData.Documento}
						readOnly
						className="w-full border border-gray-300 p-2 rounded bg-gray-100"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Nombre <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Nombre"
						value={formData.Nombre}
						onChange={handleChange}
						maxLength={30}
						required
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Celular <span className="text-red-500">*</span>
					</h3>
					<input
						type="text"
						name="Celular"
						value={formData.Celular}
						onChange={(e) => {
							const value = e.target.value;
							if (!/^\d*$/.test(value)) return;
							if (value.length > 10) return;
							if (value.length === 1 && value !== "3") return;
							setFormData({ ...formData, Celular: value });
						}}
						pattern="^3\d{9,10}$"
						maxLength={10}
						required
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Fecha de Nacimiento
					</h3>
					<input
						type="date"
						name="F_Nacimiento"
						value={formData.F_Nacimiento}
						onChange={handleChange}
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">
						Dirección
					</h3>
					<input
						type="text"
						name="Direccion"
						value={formData.Direccion}
						onChange={handleChange}
						maxLength={100}
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>

				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2 block">Sexo</h3>
					<select
						name="Sexo"
						value={formData.Sexo}
						onChange={handleChange}
						className="w-full border border-gray-300 p-2 rounded"
					>
						<option value="">Seleccione...</option>
						<option value="Masculino">Masculino</option>
						<option value="Femenino">Femenino</option>
						<option value="Otro">Otro</option>
					</select>
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
		</>
	);
};

export default EditarEmpleado;
