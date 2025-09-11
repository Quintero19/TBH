import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "../../styles/css/AuthForm.module.css";
import { showAlert } from "@/components/AlertProvider";
import api from "@/utils/api";

export default function RecoverPassword() {
	const [correo, setCorreo] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await api.post("auth/forgot-password", {
				Correo: correo,
			});

			// axios ya devuelve JSON en res.data
			if (res.status === 200) {
				showAlert(
					"Revisa tu correo. Te enviamos un enlace para recuperar tu contraseña.",
					{
						duration: 4500,
						icon: "success",
						title: "Enviado Correctamente",
					}
				);
			} else {
				showAlert(`${res.data?.message || "Error al enviar el correo"}`);
			}
		} catch (error) {
			showAlert("Error en el servidor. Intenta más tarde.", {
				icon: "error",
				title: "Error",
			},error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.pageContainer}>
			<div className={styles.card}>
				<h1 className={styles.title}>Recuperar contraseña</h1>
				<p className={styles.subtitle}>
					Ingresa tu correo electrónico y te enviaremos un enlace para
					restablecer tu contraseña.
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.inputGroup}>
						<input
							type="email"
							placeholder="Correo electrónico"
							required
							className={styles.input}
							value={correo}
							onChange={(e) => setCorreo(e.target.value)}
						/>
						<i className={styles.icon}>
							<FontAwesomeIcon icon={faEnvelope} />
						</i>
					</div>

					<button type="submit" className={styles.button} disabled={loading}>
						{loading ? "Enviando..." : "Enviar enlace"}
					</button>
				</form>

				<div className={styles.links}>
					<a href="/login" className={styles.backLink}>
						¿Recordaste tu contraseña? Inicia sesión
					</a>
				</div>
			</div>
		</div>
	);
}
