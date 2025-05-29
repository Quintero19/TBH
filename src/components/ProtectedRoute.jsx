import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

function ProtectedRoute({ children, requiredRole }) {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
		getUser().then((u) => {
			setUser(u);
			setLoading(false);
		});
	}, []);

	if (loading) return <div>Cargando...</div>;

	if (!user) return <Navigate to="/login" />;

	if (requiredRole && user.rol_id !== requiredRole) {
		return <Navigate to="/login" />;
	}

	return children;
}

export default ProtectedRoute;
