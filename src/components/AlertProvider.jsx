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

/* ---------- Variables globales privadas ---------- */
let _globalOpenAlert = null;
let _globalShowLoadingAlert = null;
let _globalCloseAlert = null;

/* ---------- Alerta ---------- */
export function AlertProvider({ children }) {
	/* Función que dispara una alerta normal */
	const openAlert = useCallback((message, options = {}) => {
		const type = options.type || "info";
		const config = typeConfig[type] || typeConfig.info;

		return Swal.fire({
			icon: config.icon,
			title: options.title || "",
			didClose: options.didClose || undefined,
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
			width: options.width || undefined,
			...(options.duration !== undefined ? { timer: options.duration } : {}),
			...options.swalOptions,
		});
	}, []);

	const showLoadingAlert = useCallback(
		(message = "Cargando...", options = {}) => {
			return Swal.fire({
				title: options.title || "Por favor espere",
				html: message,
				allowOutsideClick: false,
				allowEscapeKey: false,
				showConfirmButton: false,
				background: "#000000",
				color: "#ffffff",
				customClass: {
					confirmButton: "swal-confirm-button",
				},
				...options.swalOptions,
				didOpen: () => {
					Swal.showLoading();
				},
			});
		},
		[],
	);

	const closeAlert = () => {
		Swal.close();
	};

	useEffect(() => {
		_globalOpenAlert = openAlert;
		_globalShowLoadingAlert = showLoadingAlert;
		_globalCloseAlert = closeAlert;

		window.showAlert = openAlert;
		window.showLoadingAlert = showLoadingAlert;
		window.closeAlert = closeAlert;

		return () => {
			_globalOpenAlert = null;
			_globalShowLoadingAlert = null;
			_globalCloseAlert = null;

			window.showAlert = undefined;
			window.showLoadingAlert = undefined;
			window.closeAlert = undefined;
		};
	}, [openAlert, showLoadingAlert]);

	return (
		<AlertContext.Provider value={{ openAlert, showLoadingAlert }}>
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

export const showLoadingAlert = (message, options = {}) => {
	if (typeof _globalShowLoadingAlert === "function") {
		return _globalShowLoadingAlert(message, options);
	}
	console.warn("AlertProvider no está montado todavía.");
	return Promise.resolve();
};

export const closeAlert = () => {
	if (typeof _globalCloseAlert === "function") {
		return _globalCloseAlert();
	}
	console.warn("AlertProvider no está montado todavía.");
};
