import {
	showAlert,
	showLoadingAlert,
	closeAlert,
} from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { insumoService } from "@/service/insumo.service";
import { tamanosService } from "@/service/tamanos.service";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function AgregarTamano() {
	const navigate = useNavigate();
	const [insumos, setInsumos] = useState([]);
	const [frascos, setFrascos] = useState([]);
	const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
	const [frasco, setFrasco] = useState({
		Id_Insumos: "",
		Nombre: "",
		Cantidad: 1,
	});
	const [errors, setErrors] = useState({});
	const [formData, setFormData] = useState({
		Nombre: "",
		Precio_Venta: "",
		Cantidad_Maxima: "",
		Estado: 1,
	});

	/* ───── Validaciones Formulario ───── */

	const validateField = (name, value) => {
		const newErrors = { ...errors };

		switch (name) {
			case "Nombre":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio.";
				} else if (value.length > 20) {
					newErrors[name] = "Debe tener máximo 20 caracteres.";
				} else if (value.length < 3) {
					newErrors[name] = "Debe tener al menos 3 caracteres.";
				} else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ]+$/.test(value)) {
					newErrors[name] = "Solo se permiten letras y números.";
				} else {
					delete newErrors[name];
				}
				break;

			case "Precio_Venta":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio.";
				} else if (value.length > 10) {
					newErrors[name] = "Debe tener máximo 10 caracteres.";
				} else if (!/^\d+$/.test(value)) {
					newErrors[name] = "Solo se permiten números.";
				} else {
					delete newErrors[name];
				}
				break;

			case "Cantidad_Maxima":
				if (!value.trim()) {
					newErrors[name] = "Este campo es obligatorio.";
				} else if (value.length > 10) {
					newErrors[name] = "Debe tener máximo 10 caracteres.";
				} else if (!/^\d+$/.test(value)) {
					newErrors[name] = "Solo se permiten números.";
				} else {
					delete newErrors[name];
				}
				break;

			default:
				break;
		}

		setErrors(newErrors);
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const isValid = {
			Nombre: /^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ]*$/,
			Precio_Venta: /^\d*$/,
			Cantidad_Maxima: /^\d*$/,
		}[name];

		if (isValid && !isValid.test(value)) return;

		const updatedValue = type === "checkbox" ? checked : value;
		setFormData((prev) => ({ ...prev, [name]: updatedValue }));
		validateField(name, updatedValue);
	};

	const handleFrascoChange = (e) => {
		const insumo = frascos.find((i) => i.Id_Insumos === Number(e.target.value));
		if (insumo) {
			setFrasco({
				Id_Insumos: insumo.Id_Insumos,
				Nombre: insumo.Nombre,
				Cantidad: 1,
			});
		}
	};

	/* ─────────────────────────────────── */

	/* ─────────── Cargar Datos ────────── */

	const obtenerDatos = useCallback(async () => {
		try {
			const [resInsumos, resFrascos] = await Promise.all([
				insumoService.obtenerInsumosPorCategoria("Base"),
				insumoService.obtenerInsumosPorCategoria("Frasco"),
			]);
			setInsumos(resInsumos.data);
			setFrascos(resFrascos.data);
		} catch (error) {
			console.error("Error al obtener insumos o frascos:", error);
		}
	}, []);

	useEffect(() => {
		obtenerDatos();
	}, [obtenerDatos]);

	/* ─────────────────────────────────── */

	/* ────── Insumos Seleccionados ────── */

	const handleInsumoChange = (insumoIndex, key, value) => {
		const nuevos = [...insumosSeleccionados];
		if (key === "cantidad") {
			if (value === "" || /^\d+$/.test(value)) {
				const nuevaCantidad = value === "" ? 0 : Number(value);
				const total = calcularTotalCantidad(insumoIndex, nuevaCantidad);
				if (total > Number(formData.Cantidad_Maxima)) {
					mostrarAlerta(
						"Advertencia",
						"La suma de las cantidades excede la cantidad máxima.",
					);
					return;
				}
				nuevos[insumoIndex].Cantidad = value;
			}
		} else if (key === "id_insumo") {
			const nuevoId = Number(value);
			const duplicado = insumosSeleccionados.some(
				(i, idx) => i.Id_Insumos === nuevoId && idx !== insumoIndex,
			);
			if (duplicado)
				return mostrarAlerta(
					"Duplicado",
					"Este insumo ya ha sido seleccionado.",
				);

			const insumo = insumos.find((i) => i.Id_Insumos === nuevoId);
			if (insumo) {
				nuevos[insumoIndex] = {
					...nuevos[insumoIndex],
					Id_Insumos: insumo.Id_Insumos,
					Nombre: insumo.Nombre,
				};
			}
		}
		setInsumosSeleccionados(nuevos);
	};

	/* ─────────────────────────────────── */

	/* ────── Calcular Cantidades ──────── */

	const calcularTotalCantidad = (indice, nuevaCantidad) =>
		insumosSeleccionados.reduce(
			(sum, item, idx) =>
				sum + (idx === indice ? nuevaCantidad : Number(item.Cantidad)),
			0,
		);

	/* ─────────────────────────────────── */

	/* ─────────── +/- Insumos ─────────── */

	const addInsumo = () => {

		if (!frasco.Id_Insumos) {
			return mostrarAlerta(
				"Frasco requerido",
				"Debes seleccionar un frasco antes de agregar insumos."
			);
		}
		
		const total = insumosSeleccionados.reduce(
			(sum, i) => sum + Number(i.Cantidad),
			0,
		);
		if (total >= Number(formData.Cantidad_Maxima)) {
			mostrarAlerta("Límite alcanzado", "Ya alcanzaste la cantidad máxima.");
			return;
		}
		const pendiente = insumosSeleccionados.some((i) => i.Id_Insumos === "");
		if (pendiente)
			return mostrarAlerta(
				"Insumo pendiente",
				"Selecciona el insumo antes de agregar otro.",
			);
		setInsumosSeleccionados([
			...insumosSeleccionados,
			{ Id_Insumos: "", Nombre: "", Cantidad: "" },
		]);
	};

	const eliminarInsumo = (insumoIndex) => {
		const nuevos = [...insumosSeleccionados];
		nuevos.splice(insumoIndex, 1);
		setInsumosSeleccionados(nuevos);
	};

	/* ─────────────────────────────────── */

	/* ───────── Boton de Guardar ──────── */

	const handleSubmit = async () => {
		if (Object.keys(errors).length > 0) {
			return showAlert("Por favor corrige los errores", {
				title: "Error",
				type: "error",
				duration: 2000,
			});
		}
		try {
			showLoadingAlert("Guardando Tamaño...");
			const resTamaño = await tamanosService.crearTamano(formData);
			const Id_Tamano = resTamaño.data.Id_Tamano;

			for (const insumo of insumosSeleccionados) {
				await tamanosService.crearRelaciones({ Id_Tamano, ...insumo });
			}

			if (frasco.Id_Insumos) {
				await tamanosService.crearRelaciones({ Id_Tamano, ...frasco });
			}

			closeAlert();
			showAlert("Tamaño guardado correctamente", {
				title: "¡Éxito!",
				type: "success",
				duration: 2000,
			}).then(() => navigate("/admin/tamanos"));
		} catch (error) {
			console.error("Error al agregar el Tamaño:", error);
			closeAlert();
			const mensaje =
				error.response?.data?.message || "Error al agregar el tamaño";
			showAlert(mensaje, {
				type: "error",
				title: "Error",
				duration: 2000,
			});
		}
	};

	/* ──────────────────────────────────── */

	/* ──────── Boton de Cancelar ───────── */

	const handleCancel = () => {
		showAlert("Si cancelas, perderás los datos ingresados.", {
			title: "¿Estás seguro?",
			type: "warning",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí, cancelar",
			cancelButtonText: "Continuar Registrando",
		}).then((res) => {
			if (res.isConfirmed) navigate("/admin/tamanos");
		});
	};

	/* ──────────────────────────────────── */

	/* ──────── Alerta Reutilizable ─────── */

	const mostrarAlerta = (titulo, mensaje) => {
		showAlert(mensaje, {
			title: titulo,
			type: "warning",
			duration: 2000,
		});
	};

	/* ──────────────────────────────────── */

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Agregar Tamaño
			</h1>

			<form className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{["Nombre", "Precio_Venta", "Cantidad_Maxima"].map((campo) => (
					<div
						key={campo}
						className="bg-white p-6 rounded-xl shadow border border-gray-200"
					>
						<h3 className="text-2xl text-black font-bold mb-2 block">
							{campo.replace("_", " ")} <span className="text-red-500">*</span>
						</h3>
						<input
							name={campo}
							type="text"
							value={formData[campo]}
							onChange={handleChange}
							className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{errors[campo] && (
							<p className="text-red-500 text-sm mt-1">{errors[campo]}</p>
						)}
					</div>
				))}

				{/* Insumos */}
				<div className="md:col-span-3 bg-white p-6 rounded-xl shadow border border-gray-200">
					{/* Frasco */}
					<div className="grid grid-cols-4 gap-4 items-start mb-6">
						<div className="col-span-2">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Insumos Requeridos
							</h3>
							<select
								className="w-full border border-gray-300 px-3 py-2 rounded-md"
								value={frasco.Id_Insumos}
								onChange={handleFrascoChange}
							>
								<option value="">Seleccione un Frasco <span className="text-red-500">*</span></option>
								{frascos.map((i) => (
									<option key={i.Id_Insumos} value={i.Id_Insumos}>
										{i.Nombre}
									</option>
								))}
							</select>
						</div>
						<div className="col-span-1">
							<h3 className="text-2xl text-black font-bold mb-2 block">
								Cantidad
							</h3>
							<input
								type="number"
								value={1}
								disabled
								className="w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-100 text-gray-500"
							/>
						</div>
						<div className="col-span-1" />
					</div>

					{/* Insumos dinámicos */}
					<div className="space-y-4 mb-6">
						{insumosSeleccionados.map((insumo, insumoIndex) => (
							<div
								key={insumoIndex}
								className="grid grid-cols-4 gap-4 items-center"
							>
								<select
									className="col-span-2 border border-gray-300 px-3 py-2 rounded-md"
									value={insumo.Id_Insumos}
									onChange={(e) =>
										handleInsumoChange(insumoIndex, "id_insumo", e.target.value)
									}
								>
									<option value="">Seleccionar insumo</option>
									{insumos.map((i) => (
										<option key={i.Id_Insumos} value={i.Id_Insumos}>
											{i.Nombre}
										</option>
									))}
								</select>
								<input
									type="text"
									className="border border-gray-300 px-3 py-2 rounded-md"
									value={insumo.Cantidad}
									onChange={(e) =>
										handleInsumoChange(insumoIndex, "cantidad", e.target.value)
									}
								/>
								<div className="text-left">
									<Button
										className="red"
										icon="fa-times"
										onClick={() => eliminarInsumo(insumoIndex)}
									/>
								</div>
							</div>
						))}
					</div>

					{/* Botón agregar insumo */}
					<div className="text-right mb-4">
						<Button icon="fa-plus" className="green" onClick={addInsumo}>
							Agregar Insumo
						</Button>
					</div>

					{/* Total */}
					<p className="text-sm text-gray-600 text-right">
						Total actual:{" "}
						{insumosSeleccionados.reduce(
							(sum, i) => sum + Number(i.Cantidad),
							0,
						)}{" "}
						/ Máx: {formData.Cantidad_Maxima}
					</p>
				</div>

				{/* Botones Guardar / Cancelar */}
				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						onClick={handleSubmit}
						className="green"
						disabled={Object.keys(errors).length > 0}
						icon="fa-floppy-o"
					>
						Guardar
					</Button>
					<Button className="red" onClick={handleCancel} icon="fa-times">
						Cancelar
					</Button>
				</div>
			</form>
		</>
	);
}

export default AgregarTamano;
