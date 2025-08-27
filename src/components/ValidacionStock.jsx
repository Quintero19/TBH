import React, { useState } from "react";
import { ventasService } from "@/service/ventas.service";
import { showAlert } from "@/components/AlertProvider";

const ValidacionStock = ({ producto, tallas, tamanos, onValidacionCompleta }) => {
	const [validando, setValidando] = useState(false);
	const [resultado, setResultado] = useState(null);

	const validarStock = async () => {
		if (!producto) {
			await showAlert("Debe seleccionar un producto para validar stock", {
				type: "warning",
				title: "Producto requerido",
			});
			return;
		}

		setValidando(true);
		try {
			// Validar y filtrar tallas que tengan la estructura correcta
			const tallasValidas = Array.isArray(tallas) 
				? tallas.filter(talla => talla && talla.nombre && talla.Id_Producto_Tallas)
				: [];

			// Validar y filtrar tamaños que tengan la estructura correcta
			const tamanosValidos = Array.isArray(tamanos)
				? tamanos.filter(tamano => tamano && tamano.nombre)
				: [];

			const datosValidacion = {
				Id_Productos: producto.Id_Productos,
				Tallas: tallasValidas,
				Tamanos: tamanosValidos,
			};

			console.log("Datos de validación enviados:", datosValidacion);

			const response = await ventasService.validarStock(datosValidacion);
			setResultado(response.data);

			if (response.data.stockDisponible) {
				await showAlert("✅ Stock disponible", {
					type: "success",
					title: "Validación exitosa",
					timer: 2000,
				});
			} else {
				await showAlert("❌ Stock insuficiente", {
					type: "error",
					title: "Stock no disponible",
				});
			}

			// Llamar callback con el resultado
			if (onValidacionCompleta) {
				onValidacionCompleta(response.data);
			}
		} catch (error) {
			console.error("Error validando stock:", error);
			await showAlert("Error al validar stock", {
				type: "error",
				title: "Error",
			});
			setResultado(null);
		} finally {
			setValidando(false);
		}
	};

	return (
		<div className="mt-2">
			<button
				type="button"
				onClick={validarStock}
				disabled={validando || !producto}
				className={`px-3 py-1 text-sm rounded-md transition-colors ${
					validando
						? "bg-gray-400 text-white cursor-not-allowed"
						: producto
						? "bg-blue-600 text-white hover:bg-blue-700"
						: "bg-gray-300 text-gray-500 cursor-not-allowed"
				}`}
			>
				{validando ? "Validando..." : "Validar Stock"}
			</button>

			{resultado && (
				<div className={`mt-2 p-2 rounded-md text-sm ${
					resultado.stockDisponible 
						? "bg-green-50 text-green-800 border border-green-200" 
						: "bg-red-50 text-red-800 border border-red-200"
				}`}>
					<div className="font-medium">
						{resultado.stockDisponible ? "✅ Stock disponible" : "❌ Stock insuficiente"}
					</div>
					{resultado.mensajes && resultado.mensajes.length > 0 && (
						<ul className="mt-1 list-disc list-inside">
							{resultado.mensajes.map((mensaje, index) => (
								<li key={index}>{mensaje}</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
};

export default ValidacionStock;
