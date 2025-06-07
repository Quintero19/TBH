import PropTypes from "prop-types";
import React, {
	createContext,
	useContext,
	useCallback,
	useEffect,
} from "react";
import Swal from "sweetalert2";

/* ---------- Configuración ---------- */
const AlertContext = createContext();

const typeConfig = {
	info: { icon: "info" },
	success: { icon: "success" },
	warning: { icon: "warning" },
	error: { icon: "error" },
};

/* ---------- Variable global privada ---------- */
let _globalOpenAlert = null;

/* ---------- Alerta ---------- */
export function AlertProvider({ children }) {
	/* Función única que dispara SwAl2 */
	const openAlert = useCallback((message, options = {}) => {
		const type = options.type || "info";
		const config = typeConfig[type] || typeConfig.info;

		return Swal.fire({
			icon: config.icon,
			title: options.title || "",
			html: message,
			timerProgressBar: true,
			showConfirmButton: options.showConfirmButton ?? false,
			showCancelButton: options.showCancelButton ?? false,
			confirmButtonText: options.confirmButtonText || undefined,
			cancelButtonText: options.cancelButtonText || undefined,
			background: "#000000",
			color: "#ffffff",
			customClass: {
				cancelButton: "swal-cancel-button",
				confirmButton: "swal-confirm-button",
			},
			...(options.duration !== undefined ? { timer: options.duration } : {}),
			...options.swalOptions,
		});
	}, []);

	useEffect(() => {
		_globalOpenAlert = openAlert;
		window.showAlert = openAlert;

		return () => {
			_globalOpenAlert = null;
			window.showAlert = undefined;
		};
	}, [openAlert]);

	return (
		<AlertContext.Provider value={{ openAlert }}>
			{children}
		</AlertContext.Provider>
	);
}

AlertProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export const useAlert = () => useContext(AlertContext);

export const showAlert = (message, options = {}) => {
	if (typeof _globalOpenAlert === "function") {
		return _globalOpenAlert(message, options);
	}
	console.warn("AlertProvider no está montado todavía.");
	return Promise.resolve();
};
