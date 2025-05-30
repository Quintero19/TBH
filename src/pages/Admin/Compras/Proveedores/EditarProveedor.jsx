import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import Sidebar from "../../../../components/sideBar";
import { proveedorService } from "../../../../service/proveedores.service";

const EditarProveedor = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Id_Proveedores: "",
		Tipo_Proveedor: "",
		Nombre_Empresa: "",
		Asesor: "",
		Celular_Empresa: "",
		Celular_Asesor: "",
		Tipo_Documento: "",
		Documento: "",
		Nombre: "",
		Celular: "",
		Email: "",
		Direccion: "",
		Estado: true,
	});

	useEffect(() => {
		const cargarProveedor = async () => {
			try {
				const data = await proveedorService.obtenerProveedorPorId(id);
				setFormData(data.data);
			} catch (error) {
				console.error("Error al cargar proveedor:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo cargar el proveedor",
					icon: "error",
				});
				navigate("/admin/proveedores");
			}
		};

		cargarProveedor();
	}, [id, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (name === "NIT") {
			const regex = /^[0-9-]*$/;
			if (!regex.test(value)) return;
		}

		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await proveedorService.actualizarProveedor(id, formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "El proveedor ha sido actualizado correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/proveedores");
			});
		} catch (error) {
			console.error("Error al actualizar proveedor:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo actualizar el proveedor.",
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
				navigate("/admin/proveedores");
			}
		});
	};

	return (
		<>
			<Sidebar />
			<div className="md:ml-64 p-6 md:p-20">
				<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
					Editar Proveedor
				</h1>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					<div
						className={`p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 ${
							formData.Tipo_Proveedor === "Natural"
								? "md:col-span-2"
								: "md:col-span-1"
						}`}
					>
						<h3 className="text-2xl text-black font-bold mb-2 block">
							Tipo de Proveedor <span className="text-red-500">*</span>
						</h3>
						<select
							name="Tipo_Proveedor"
							value={formData.Tipo_Proveedor}
							onChange={handleChange}
							required
							className="w-full p-2 border rounded"
						>
							<option value="">Seleccione el Tipo</option>
							<option value="Natural">Natural</option>
							<option value="Empresa">Empresa</option>
						</select>
					</div>

					{/* Mostrar campos según tipo */}
					{formData.Tipo_Proveedor === "Empresa" && (
						<>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									NIT <span className="text-red-500">*</span>
								</h3>
								<input
									type="text"
									name="NIT"
									value={formData.NIT}
									onChange={handleChange}
									maxLength={15}
									className="w-full border border-gray-300 p-2 rounded"
								/>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Nombre de la Empresa <span className="text-red-500">*</span>
								</h3>
								<input
									type="text"
									name="Nombre_Empresa"
									value={formData.Nombre_Empresa}
									onChange={handleChange}
									maxLength={30}
									className="w-full border border-gray-300 p-2 rounded"
								/>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2">Asesor</h3>
								<input
									type="text"
									name="Asesor"
									value={formData.Asesor}
									onChange={handleChange}
									maxLength={30}
									className="w-full border border-gray-300 p-2 rounded"
								/>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Celular Empresa <span className="text-red-500">*</span>
								</h3>
								<input
									type="text"
									name="Celular_Empresa"
									value={formData.Celular_Empresa}
									onChange={(e) => {
										const value = e.target.value;
										if (!/^\d*$/.test(value)) return;
										if (value.length > 10) return;
										if (value.length === 1 && value !== "3") return;
										setFormData({ ...formData, Celular_Empresa: value });
									}}
									className="w-full border border-gray-300 p-2 rounded"
								/>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2">
									Celular Asesor
								</h3>
								<input
									type="text"
									name="Celular_Asesor"
									value={formData.Celular_Asesor}
									onChange={(e) => {
										const value = e.target.value;
										if (!/^\d*$/.test(value)) return;
										if (value.length > 10) return;
										if (value.length === 1 && value !== "3") return;
										setFormData({ ...formData, Celular_Asesor: value });
									}}
									className="w-full border border-gray-300 p-2 rounded"
								/>
							</div>
						</>
					)}

					{/* Mostrar campos Tipo Natural */}
					{formData.Tipo_Proveedor === "Natural" && (
						<>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Tipo de Documento
								</h3>
								<select
									name="Tipo_Documento"
									value={formData.Tipo_Documento}
									onChange={handleChange}
									className="w-full border border-gray-300 p-2 rounded"
								>
									<option value="">Seleccione el Tipo</option>
									<option value="C.C">C.C - Cédula de Ciudadanía</option>
									<option value="T.E">T.E - Tarjeta de Identidad</option>
									<option value="C.E">C.E - Cédula de Extranjería</option>
									<option value="P.P">P.P - Pasaporte</option>
									<option value="PEP">
										PEP - Permiso Especial de Permanencia
									</option>
								</select>
							</div>
							<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
								<h3 className="text-2xl text-black font-bold mb-2 block">
									Documento
								</h3>
								<input
									type="text"
									name="Documento"
									value={formData.Documento}
									onChange={handleChange}
									maxLength={11}
									className="w-full border border-gray-300 p-2 rounded"
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
						</>
					)}

					<div className="md:col-span-2 flex gap-2 ml-7">
						<Button type="submit" className="green">
							Guardar
						</Button>

						<Button className="red" onClick={handleCancel}>
							Cancelar
						</Button>
					</div>
				</form>
			</div>
		</>
	);
};

export default EditarProveedor;
