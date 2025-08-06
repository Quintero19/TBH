import React, { useCallback, useEffect, useState } from "react";
import GeneralTable from "@/components/GeneralTable";
import { ventasService } from "@/service/ventas.service";
import { showAlert } from "@/components/AlertProvider";
import { useNavigate } from "react-router-dom";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const navigate = useNavigate();

  const columns = [
		{ header: "ID", accessor: "Id_Ventas" },
		{ header: "Empleado", accessor: "Id_Empleados" },
		{ header: "Fecha", accessor: "Fecha" },
		{ header: "Total", accessor: "Total" },
		{ header: "Estado", accessor: "Estado" },
	];

	/*--------------CARGAR LAS VENTAS---------------------------------*/

	const fetchVentas = useCallback(async () => {
		try {
			const response = await ventasService.obtenerVentas();
			setVentas(transformData(response.data));
			console.log(response);
		} catch (error) {
					const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
						showAlert(`Error: ${mensaje || error}`, {
								duration: 2500,
								title: "Error",
								icon: "error",
								didClose: () => {navigate(-1)},
							})
						}
	}, []);

	useEffect(() => {
		fetchVentas();
	}, [fetchVentas]);

	/*----------------------------------------------------------------*/

	/*-----------------FORMATEAR LOS PRECIOS A COP---------------------*/
		const formatCOP = (value) => {
			if (!value && value !== 0) return "";
			return `$ ${Number(value).toLocaleString("es-CO")}`;
		};

		const transformData = useCallback(
			(lista) =>
				lista.map((item) => ({
				...item,
					Total: item.Total ? formatCOP(item.Total) : "-",
				})),
			[]
		);

	/*----------------------------------------------------------------*/

	/*-----------------CAMBIAR EL ESTADO DE LA VENTA------------------*/

	/*----------------------------------------------------------------*/
	
	/*---------------------AGREGAR------------------------------------*/

	const handleAdd = () => {
		navigate("/admin/ventas/agregar");
	};

	/*----------------------------------------------------------------*/



  return (
	<GeneralTable
		title="Ventas"
		columns={columns}
		data={ventas}
		onAdd={handleAdd}
		// onView={handleVerDetalles}
		// onCancel={handleToggleEstado}
		idAccessor="Id_Ventas"
		stateAccessor="Estado"
	/>
  )
}

export default Ventas