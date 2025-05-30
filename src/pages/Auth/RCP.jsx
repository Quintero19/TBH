import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styles from "../../styles/css/AuthForm.module.css";

export default function RecoverPassword() {
	const handleSubmit = (e) => {
		e.preventDefault();
		alert("Enlace de recuperación enviado al correo");
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
						/>
						<i className={styles.icon}>
							<FontAwesomeIcon icon={faEnvelope} />
						</i>
					</div>

					<button type="submit" className={styles.button}>
						Enviar enlace
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
