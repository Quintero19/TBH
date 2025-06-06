import React, { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { catProductoService } from "../../../../service/categoriaProducto.service";

const EditarCatProducto = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		Id_Categoria_Producto: "",
		Nombre: "",
		Descripcion: "",
		Es_Ropa: true,
		Estado: true,
	});

	useEffect(() => {
		const cargarCategoria = async () => {
			try {
				const data = await catProductoService.obtenerCategoriaPorId(id);
				setFormData(data.data);
			} catch (error) {
				console.error("Error al cargar la categoria:", error);
				Swal.fire({
					title: "Error",
					text: "No se pudo cargar la categoria",
					icon: "error",
				});
				navigate("/admin/categoriaproducto");
			}
		};

		cargarCategoria();
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
			await catProductoService.actualizarCategoria(id, formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "La Categoria ha sido actualizada correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/categoriaproducto");
			});
		} catch (error) {
			console.error("Error al actualizar la categoria:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo actualizar la categoria.",
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
				navigate("/admin/categoriaproducto");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Categoria Producto
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
						required
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">Descripción</h3>
					<input
						type="text"
						name="Descripcion"
						value={formData.Descripcion}
						onChange={handleChange}
						maxLength={100}
						className="w-full border border-gray-300 p-2 rounded"
					/>
				</div>
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2 flex items-center">
					<h3 className="text-2xl text-black font-bold mb-2">Es Ropa?</h3>
					<input
						type="checkbox"
						name="Es_Ropa"
						checked={formData.Es_Ropa}
						onChange={handleChange}
						className="border border-gray-300 p-2 rounded"
						id="esRopa"
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
		</>
	);
};

export default EditarCatProducto;
