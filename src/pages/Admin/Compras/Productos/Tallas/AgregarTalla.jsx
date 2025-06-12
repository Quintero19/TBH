import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../../components/Buttons/Button";
import { catProductoService } from "../../../../../service/categoriaProducto.service";
import { tallasService } from "../../../../../service/tallas.service";

const AgregarTalla = () => {
	const navigate = useNavigate();
	const [categorias, setCategorias] = useState([]);

	const [formData, setFormData] = useState({
		Nombre: "",
		Id_Categoria_Producto: "",
		Estado: true,
	});

	useEffect(() => {
		const fetchCategorias = async () => {
			try {
				const response = await catProductoService.obtenerCategoriasRopa();
				setCategorias(response.data);
			} catch (error) {
				console.error("Error al obtener categorías:", error);
			}
		};

		fetchCategorias();
	}, []);

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
			await tallasService.crearTalla(formData);
			Swal.fire({
				title: "¡Éxito!",
				text: "La Talla ha sido guardada correctamente.",
				icon: "success",
				timer: 2000,
				showConfirmButton: false,
				background: "#000",
				color: "#fff",
			}).then(() => {
				navigate("/admin/tallas");
			});
		} catch (error) {
			console.error("Error al agregar la talla:", error);
			alert("Ocurrió un error al agregar la talla.");
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
				navigate("/admin/tallas");
			}
		});
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Talla
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
					<h3 className="text-2xl text-black font-bold mb-2">
						Categoría de Producto <span className="text-red-500">*</span>
					</h3>
					<select
						name="Id_Categoria_Producto"
						value={formData.Id_Categoria_Producto}
						onChange={handleChange}
						required
						className="w-full border border-gray-300 p-2 rounded"
					>
						<option value="">Seleccione una categoría</option>
						{categorias.map((categoria) => (
							<option
								key={categoria.Id_Categoria_Producto}
								value={categoria.Id_Categoria_Producto}
							>
								{categoria.Nombre}
							</option>
						))}
					</select>
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button type="submit" className="green" icon="fa-floppy-o">
						Guardar
					</Button>
					<Button className="red" onClick={handleCancel} icon="fa-times">
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
};

export default AgregarTalla;
