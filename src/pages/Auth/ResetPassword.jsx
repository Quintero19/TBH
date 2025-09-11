import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../styles/css/AuthForm.module.css";
import { showAlert } from "@/components/AlertProvider";
import api from "@/utils/api";

export default function ResetPassword() {
	const { token } = useParams();
	const navigate = useNavigate();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			showAlert("Las contraseñas no coinciden", {
				icon: "warning",
				title: "Atención",
			});
			return;
		}

		setLoading(true);

		try {
			const res = await api.post(`auth/reset-password/${token}`, {
				nuevaPassword: password,
			});

			if (res.status === 200) {
				showAlert("Contraseña restablecida con éxito. Serás redirigido al login...", {
					icon: "success",
					title: "Éxito",
					duration: 3000,
				});
				setTimeout(() => navigate("/login"), 2500);
			} else {
				showAlert(`${res.data?.message || "Error al restablecer la contraseña"}`, {
					icon: "error",
					title: "Error",
				});
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
			</div>
		</div>
	);
}
