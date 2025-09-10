import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "../../styles/css/AuthForm.module.css";
import { showAlert } from "@/components/AlertProvider";

export default function RecoverPassword() {
	const [correo, setCorreo] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMensaje("");

		try {
			const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ Correo: correo }),
			});

			const data = await res.json();

			if (res.ok) {
				showAlert("Revisa tu correo. Te enviamos un enlace para recuperar tu contraseña.",{
						duration: 4500,
						icon: "success",
						title: "Enviado Correctamente",
					}
				);
				
			} else {
				showAlert(`${data.message || "Error al enviar el correo"}`);
			}
		} catch (error) {
			showAlert("Error en el servidor. Intenta más tarde.");
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

				{mensaje && <p className={styles.message}>{mensaje}</p>}

				<div className={styles.links}>
					<a href="/login" className={styles.backLink}>
						¿Recordaste tu contraseña? Inicia sesión
					</a>
				</div>
			</div>
		</div>
	);
}
