import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../styles/css/AuthForm.module.css";
import { showAlert } from "@/components/AlertProvider";

export default function ResetPassword() {
	const { token } = useParams(); // token viene de la URL
	const navigate = useNavigate();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [mensaje, setMensaje] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMensaje("");

		if (password !== confirmPassword) {
			showAlert("Las contraseñas no coinciden");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`http://localhost:3000/api/auth/reset-password/${token}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nuevaPassword: password }),
			});

			const data = await res.json();

			if (res.ok) {
				showAlert("Contraseña restablecida con éxito. Serás redirigido al login...");
				setTimeout(() => navigate("/login"), 2500);
			} else {
				showAlert(`${data.message || "Error al restablecer la contraseña"}`);
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
				<h1 className={styles.title}>Restablecer contraseña</h1>
				<p className={styles.subtitle}>
					Ingresa tu nueva contraseña para continuar.
				</p>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.inputGroup}>
						<input
							type="password"
							placeholder="Nueva contraseña"
							required
							className={styles.input}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<div className={styles.inputGroup}>
						<input
							type="password"
							placeholder="Confirmar contraseña"
							required
							className={styles.input}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>

					<button type="submit" className={styles.button} disabled={loading}>
						{loading ? "Actualizando..." : "Actualizar contraseña"}
					</button>
				</form>

				{mensaje && <p className={styles.message}>{mensaje}</p>}
			</div>
		</div>
	);
}
