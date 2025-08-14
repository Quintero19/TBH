import React, { useEffect, useRef, useState } from "react";
import Button from "@/components/Buttons/Button";

const CarruselImagenes = ({ imagenes, visible, onClose }) => {
	const [indice, setIndice] = useState(0);
	const contenedorRef = useRef(null);

	useEffect(() => {
		if (!visible) return;

		const handleOutsideClick = (e) => {
			if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [visible, onClose]);

	if (!visible || !imagenes?.length) return null;

	const anterior = () =>
		setIndice((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));

	const siguiente = () =>
		setIndice((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
			<div
				ref={contenedorRef}
				className="relative bg-transparent w-fit max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center"
			>
				<div className="absolute top-20 right-4 z-50">
					<Button onClick={onClose} className="red" icon="fa-times" />
				</div>

				<img
					src={imagenes[indice]?.URL || imagenes[indice]}
					alt={`Imagen ${indice + 1}`}
					className="max-h-[80vh] max-w-[90vw] object-contain rounded shadow-lg"
				/>

				<div className="absolute left-4 top-1/2 -translate-y-1/2 z-40">
					<Button onClick={anterior} className="gray" icon="fa-chevron-left" />
				</div>
				<div className="absolute right-4 top-1/2 -translate-y-1/2 z-40">
					<Button
						onClick={siguiente}
						className="gray"
						icon="fa-chevron-right"
					/>
				</div>

				<div className="text-center mt-4 text-gray-300 text-sm">
					{indice + 1} / {imagenes.length}
				</div>
			</div>
		</div>
	);
};

export default CarruselImagenes;
