import {
	faArrowLeft,
	faArrowRight,
	faEnvelope,
	faEye,
	faEyeSlash,
	faIdCard,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "@/styles/css/AuthForm.module.css";
import api from "@/utils/api";
import { showAlert } from "@/components/AlertProvider";

const ENDPOINTS = {
	login: "/auth/login",
	register: "/auth/register",
	me: "/me/",
};

const AuthForm = () => {
	const [isLogin, setIsLogin] = useState(true);
	const [correo, setCorreo] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [documento, setDocumento] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");

		if (!isLogin && password !== confirmPassword) {
			return showAlert("Las contraseñas no coinciden." , {
				type: "error",
				title: "Datos inválidos",
			},setLoading(false))
		}

		if (!isLogin && (documento.length < 7 || documento.length > 15)) {
			return showAlert("El documento debe tener entre 7 y 15 números.",{
				type: "error",
				title: "Datos inválidos",
			},setLoading(false))
		}

		if (password.length < 6 ||
			!/[0-9]/.test(password) 
		) {
			return showAlert(
				"La contraseña debe tener al menos 6 caracteres, un número y un carácter especial.",
				{
					type: "error",
					title: "Datos inválidos",
				},setLoading(false)
			);
		}

		await new Promise((resolve) => setTimeout(resolve, 3000));

		const endpoint = isLogin ? ENDPOINTS.login : ENDPOINTS.register;
		const payload = isLogin
			? { Correo: correo, Password: password }
			: { Documento: documento, Correo: correo, Password: password };

		try {
			const response = await api.post(endpoint, payload);

			if (response.status === 200 || response.status === 201) {
				if (isLogin) {
					showAlert("¡Login exitoso!",{
						type: "success",
						duration: 2500,
					});

					const meResponse = await api.get(ENDPOINTS.me);
					const { user } = meResponse.data;

					if (user.rol_id === 2) {
						window.location.href = "/usuario/index";
					} else if (user.rol_id) {
						window.location.href = "/admin/dashboard";
					}
				} else {
					showAlert("Registro exitoso!",{
						type: "success",
						duration: 2500,
						
					});
				}
			}
		} catch (error) {
				const errorMessage = error.response?.data?.error || "Error al conectar con el servidor.";
				console.error("Error:", errorMessage);

				showAlert(`Error: ${errorMessage}`, {
					duration: 2500,
					title: "Error",
					icon: "error",
					didClose: () => { navigate(-1) },
				});

				setMessage(errorMessage);
			} finally {
				setLoading(false);
			}

	};

	return (
		<div className={`${styles.container} ${isLogin ? "" : styles.active}`}>
			<div
				className={`${styles["form-box"]} ${isLogin ? styles.login : styles.register}`}
			>
				<form onSubmit={handleSubmit}>
					<h1>{isLogin ? "Ingresar" : "Registro De Cliente"}</h1>

					{!isLogin && (
						<div className={styles["input-box"]}>
							<input
								type="text"
								placeholder="Documento"
								value={documento}
								onChange={(e) => {
									const value = e.target.value;
									
									if (/^\d*$/.test(value)) {
										setDocumento(value);
									}
								}}
							/>


							<i className={styles.icon}>
								<FontAwesomeIcon icon={faIdCard} />
							</i>
						</div>
					)}

					<div className={styles["input-box"]}>
						<input
							type="email"
							placeholder="Correo electrónico"
							required
							value={correo}
							onChange={(e) => setCorreo(e.target.value)}
						/>
						<i className={styles.icon}>
							<FontAwesomeIcon icon={faEnvelope} />
						</i>
					</div>

					<div className={styles["input-box"]}>
						<input
							type={showPassword ? "text" : "password"}
							placeholder="Contraseña"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button
							type="button"
							className={styles.icon}
							onClick={() => setShowPassword(!showPassword)}
							style={{
								cursor: "pointer",
								background: "none",
								border: "none",
								padding: 0,
							}}
							aria-label={
								showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
							}
						>
							<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
						</button>
					</div>

					{!isLogin && (
						<div className={styles["input-box"]}>
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Confirmar contraseña"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>

							<button
								type="button"
								className={styles.icon}
								onClick={() => setShowPassword(!showPassword)}
								style={{
									cursor: "pointer",
									background: "none",
									border: "none",
									padding: 0,
								}}
								aria-label={
									showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
								}
							>
								<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
							</button>
						</div>
					)}

					{isLogin && (
						<div className={styles["forgot-link"]}>
							<a href="/rcp">¿Has olvidado tu contraseña?</a>
						</div>
					)}

					<button type="submit" className={styles.btn} disabled={loading}>
						{loading ? (
							<span className="loader" />
						) : isLogin ? (
							"Entrar"
						) : (
							"Registrarse"
						)}
					</button>

					{message && <p className={styles.message}>{message}</p>}
				</form>
			</div>

			<div className={styles["toggle-box"]}>
				<div className={`${styles["toggle-panel"]} ${styles["toggle-left"]}`}>
					<a href="/" style={{ color: "inherit" }}>
						<div>
							<FontAwesomeIcon icon={faArrowLeft} style={{ color: "#fff" }} />
						</div>
					</a>
					<button
						type="button"
						className={styles.btn}
						onClick={() => setIsLogin(false)}
					>
						Registro
					</button>
				</div>
				<div className={`${styles["toggle-panel"]} ${styles["toggle-right"]}`}>
					<a href="/">
						<div>
							<FontAwesomeIcon icon={faArrowRight} style={{ color: "#fff" }} />
						</div>
					</a>
					<button
						type="button"
						className={styles.btn}
						onClick={() => setIsLogin(true)}
					>
						Ingreso
					</button>
				</div>
			</div>
		</div>
	);
};

export default AuthForm;
