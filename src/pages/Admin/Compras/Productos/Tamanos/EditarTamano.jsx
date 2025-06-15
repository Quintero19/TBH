import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { insumoService } from "@/service/insumo.service";
import { tamanosService } from "@/service/tamanos.service";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditarTamano() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [insumos, setInsumos] = useState([]);
	const [frascos, setFrascos] = useState([]);
	const [formData, setFormData] = useState({
		Nombre: "",
		Precio_Venta: "",
		Cantidad_Maxima: "",
		Estado: 1,
	});
	const [errors, setErrors] = useState({});
	const [frascoSeleccionado, setFrascoSeleccionado] = useState("");
	const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);

	const validateField = (name, value) => {
		const newErrors = { ...errors };
		if (name === "Nombre" && value.trim().length > 0 && value.length < 3)
			newErrors[name] = "Debe tener al menos 3 caracteres";
		else if (name === "Precio_Venta" && value && !/^\d+$/.test(value))
			newErrors[name] = "Solo números";
		else if (name === "Cantidad_Maxima" && !value.trim())
			newErrors[name] = "Requerido";
		else delete newErrors[name];
		setErrors(newErrors);
	};

	const handleChange = ({ target: { name, value } }) => {
		if (name === "Nombre" && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ0-9 ]*$/.test(value)) return;
		if (
			["Precio_Venta", "Cantidad_Maxima"].includes(name) &&
			!/^\d*$/.test(value)
		)
			return;
		setFormData((f) => ({ ...f, [name]: value }));
		validateField(name, value);
	};

	const handleInsumoChange = (insumoIndex, field, val) => {
		const list = [...insumosSeleccionados];
		if (field === "id_insumo") {
			const id = Number(val);
			if (list.some((i, i2) => i.Id_Insumos === id && i2 !== insumoIndex))
				return showAlert("Insumo Duplicado", { type: "warning" , title: "Advertencia", duration: 2000});
			const encontrado = insumos.find((i) => i.Id_Insumos === id);
			if (encontrado)
				list[insumoIndex] = { ...list[insumoIndex], Id_Insumos: id, Nombre: encontrado.Nombre };
		} else if (field === "cantidad" && (/^\d*$/.test(val) || val === "")) {
			const nuevaCant = val === "" ? "" : Number(val);
			const total = list.reduce(
				(sum, i, i2) => sum + (i2 === insumoIndex ? nuevaCant : Number(i.Cantidad)),
				0,
			);
			if (formData.Cantidad_Maxima && total > Number(formData.Cantidad_Maxima))
				return showAlert("Excede la cantidad Maxima colocada", { type: "warning" , title: "Advertencia", duration: 2000});
			list[insumoIndex].Cantidad = val;
		}
		setInsumosSeleccionados(list);
	};

	const addInsumo = () => {
		const total = insumosSeleccionados.reduce(
			(s, i) => s + Number(i.Cantidad || 0),
			0,
		);
		if (total >= Number(formData.Cantidad_Maxima))
			return showAlert("Máximo alcanzado", { type: "warning" , title: "Advertencia", duration: 2000});
		if (insumosSeleccionados.some((i) => !i.Id_Insumos))
			return showAlert("Hay un insumo pendiente por completar", { type: "warning" , title: "Advertencia", duration: 2000});
		setInsumosSeleccionados([
			...insumosSeleccionados,
			{ Id_Insumos: "", Nombre: "", Cantidad: "" },
		]);
	};

	const handleSubmit = async () => {
		if (Object.keys(errors).length)
			return showAlert("Corrige errores", { type: "warning", title: "Error", duration: 2000});
		if (!frascoSeleccionado)
			return showAlert("Debe seleccionar al menos el frasco del tamaño", { type: "error", title: "Error", duration: 2000});

		const payload = {
			Id_Tamano: Number(id),
			Nombre: formData.Nombre,
			Precio_Venta: Number.parseFloat(formData.Precio_Venta),
			Cantidad_Maxima: Number.parseInt(formData.Cantidad_Maxima),
			insumos: [
				{ Id_Insumos: Number(frascoSeleccionado), Cantidad: 1 },
				...insumosSeleccionados.map((i) => ({
					Id_Insumos: i.Id_Insumos,
					Cantidad: Number(i.Cantidad),
				})),
			],
		};

		try {
			await tamanosService.actualizarTamano(id, payload);
			showAlert("Actualizado", { type: "success", title: "¡Éxito!", duration: 2000}).then(() =>
				navigate("/admin/tamanos"),
			);
		} catch (err) {
			console.error(err);
			showAlert("Error al actualizar", { type: "error", title: "Error", duration: 2000});
		}
	};

	const handleCancel = () => {
		showAlert("Perderás los cambios", {
			type: "warning",
			title: "¿Cancelar?",
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: "Sí",
			cancelButtonText: "No",
		}).then((r) => r.isConfirmed && navigate("/admin/tamanos"));
	};

	useEffect(() => {
		const loadData = async () => {
			try {
				const [insumosRes, frascosRes, tamanoRes] = await Promise.all([
					insumoService.obtenerInsumosBase(),
					insumoService.obtenerInsumosFrascos(),
					tamanosService.obtenerTamanoPorId(id),
				]);

				const {
					Nombre,
					Precio_Venta,
					Cantidad_Maxima,
					Estado,
					Tamano_Insumos,
				} = tamanoRes.data;
				setInsumos(insumosRes.data);
				setFrascos(frascosRes.data);
				setFormData({
					Nombre,
					Precio_Venta: String(Math.floor(Precio_Venta)),
					Cantidad_Maxima: String(Cantidad_Maxima),
					Estado,
				});

				const frascoRel = Tamano_Insumos.find((r) =>
					frascosRes.data.some((f) => f.Id_Insumos === r.Id_Insumos),
				);
				if (frascoRel) setFrascoSeleccionado(String(frascoRel.Id_Insumos));

				const otros = Tamano_Insumos.filter((r) =>
					insumosRes.data.some((i) => i.Id_Insumos === r.Id_Insumos),
				);
				setInsumosSeleccionados(
					otros.map((r) => ({
						Id_Insumos: r.Id_Insumos,
						Cantidad: String(Math.floor(r.Cantidad)),
						Nombre: "",
					})),
				);
			} catch (e) {
				console.error(e);
				showAlert("Error al cargar datos", { type: "error" , title: "Error", duration: 2000});
			}
		};
		loadData();
	}, [id]);

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Editar Tamaño
			</h1>

			<form className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{["Nombre", "Precio_Venta", "Cantidad_Maxima"].map((campo) => (
					<div
						key={campo}
						className="bg-white p-6 rounded-xl shadow border border-gray-200"
					>
						<h3 className="text-2xl text-black font-bold mb-2">
							{campo.replace("_", " ")} <span className="text-red-500">*</span>
						</h3>
						<input
							name={campo}
							type="text"
							value={formData[campo]}
							maxLength={campo === "Nombre" ? 20 : 10}
							onChange={handleChange}
							className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
						{errors[campo] && (
							<p className="text-red-500 text-sm mt-1">{errors[campo]}</p>
						)}
					</div>
				))}

				{/* Frasco */}
				<div className="md:col-span-3 bg-white p-6 rounded-xl shadow border border-gray-200">
					<div className="grid grid-cols-4 gap-4 items-start mb-6">
						<div className="col-span-2">
							<h3 className="text-2xl text-black font-bold mb-2">Frasco</h3>
							<select
								className="w-full border px-3 py-2 rounded-md"
								value={frascoSeleccionado}
								onChange={(e) => setFrascoSeleccionado(e.target.value)}
							>
								<option value="">Seleccione un Frasco</option>
								{frascos.map((f) => (
									<option key={f.Id_Insumos} value={f.Id_Insumos}>
										{f.Nombre}
									</option>
								))}
							</select>
						</div>

						<div className="col-span-1">
							<h3 className="text-2xl text-black font-bold mb-2">Cantidad</h3>
							<input
								type="number"
								value={1}
								disabled
								className="w-full border px-3 py-2 rounded-md bg-gray-100 text-gray-500"
							/>
						</div>
					</div>

					{/* Insumos dinámicos */}
					<div className="space-y-4 mb-6">
						{insumosSeleccionados.map((insumo, insumoIndex) => (
							<div key={insumoIndex} className="grid grid-cols-4 gap-4 items-center">
								<select
									className="col-span-2 border px-3 py-2 rounded-md"
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
									className="border px-3 py-2 rounded-md"
									value={insumo.Cantidad}
									onChange={(e) =>
										handleInsumoChange(insumoIndex, "cantidad", e.target.value)
									}
								/>
								<div className="text-left">
									<Button
										className="red"
										icon="fa-times"
										onClick={() =>
											setInsumosSeleccionados((prev) =>
												prev.filter((_, i) => i !== insumoIndex),
											)
										}
									/>
								</div>
							</div>
						))}
					</div>

					<div className="text-right mb-4">
						<Button icon="fa-plus" className="green" onClick={addInsumo}>
							Agregar Insumo
						</Button>
					</div>

					<p className="text-sm text-gray-600 text-right">
						Total actual:{" "}
						{insumosSeleccionados.reduce(
							(s, i) => s + Number(i.Cantidad || 0),
							0,
						)}{" "}
						/ Máx: {formData.Cantidad_Maxima}
					</p>
				</div>

				<div className="md:col-span-2 flex gap-2 ml-7">
					<Button
						onClick={handleSubmit}
						className="green"
						icon="fa-floppy-o"
						disabled={Object.keys(errors).length > 0}
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
