import { showAlert } from "@/components/AlertProvider";
import React from "react";

export default function Usuario() {
	const lanzar = () =>
    showAlert("<strong>¡Ups!</strong> Algo salió mal.", {
      type: "error",
      title: "Error",
      showCancelButton: true,
      swalOptions: { confirmButtonText: "Entendido" },
    });

	const lanzar2 = () =>
    showAlert("<strong>¡Ups!</strong> Algo salió mal.", {
      type: "success",
      title: "Error",
      showConfirmButton: true,
    //   swalOptions: { confirmButtonText: "Entendido" },
    });


	return (
		 <>
      		<button onClick={lanzar}>Mostrar Alerta</button>

			<button onClick={lanzar2}>Mostrar Alerta</button>
    	</>
	);
}
