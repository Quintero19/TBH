import { Route, Routes } from "react-router-dom";
import "../styles/css/App.css";

import Dashboard from "../pages/Admin/Dashboard";
import AuthForm from "../pages/Auth/AuthForm";
import RecoverPassword from "../pages/Auth/RCP";
import Home from "../pages/Landing/Home";

import CategoriaInsumoAdmin from "../pages/Admin/Compras/CategoriaInsumos/Index";
import CategoriaProductoAdmin from "../pages/Admin/Compras/CategoriaProductos/Index";
import CompraAdmin from "../pages/Admin/Compras/Compra/Index";
import InsumoAdmin from "../pages/Admin/Compras/Insumos/Index";
import ProductoAdmin from "../pages/Admin/Compras/Productos/Index";
import Proveedores from "../pages/Admin/Compras/Proveedores/Index";
import RolesAdmin from "../pages/Admin/Configuracion/Roles/Index";
import AgendamientoAdmin from "../pages/Admin/Servicios/Agendamiento/Index";
import HorarioAdmin from "../pages/Admin/Servicios/Horarios/Index";
import ServicioAdmin from "../pages/Admin/Servicios/Servicio/Index";
import EmpleadoAdmin from "../pages/Admin/Usuarios/Empleados/Index";
import UsuarioAdmin from "../pages/Admin/Usuarios/Usuario/Index";
import ClienteAdmin from "../pages/Admin/Ventas/Clientes/Index";
import DevolucionesAdmin from "../pages/Admin/Ventas/Devoluciones/Index";
import VentaAdmin from "../pages/Admin/Ventas/Venta/Index";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import UsuarioIndex from "../pages/Usuario/Index";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<AuthForm />} />
			<Route path="/rcp" element={<RecoverPassword />} />

			{/* Layout para admin */}
			<Route
				element={
					<ProtectedRoute requiredRole={1}>
						<AdminLayout />
					</ProtectedRoute>
				}
			>
				<Route path="/admin/dashboard" element={<Dashboard />} />
				<Route path="/admin/roles" element={<RolesAdmin />} />
				<Route path="/admin/usuario" element={<UsuarioAdmin />} />
				<Route path="/admin/empleado" element={<EmpleadoAdmin />} />
				<Route path="/admin/servicios" element={<ServicioAdmin />} />
				<Route path="/admin/agendamiento" element={<AgendamientoAdmin />} />
				<Route path="/admin/horarios" element={<HorarioAdmin />} />
				<Route path="/admin/compras" element={<CompraAdmin />} />
				<Route path="/admin/proveedores" element={<Proveedores />} />
				<Route
					path="/admin/categoriaproducto"
					element={<CategoriaProductoAdmin />}
				/>
				<Route path="/admin/producto" element={<ProductoAdmin />} />
				<Route
					path="/admin/categoriainsumo"
					element={<CategoriaInsumoAdmin />}
				/>
				<Route path="/admin/insumo" element={<InsumoAdmin />} />
				<Route path="/admin/ventas" element={<VentaAdmin />} />
				<Route path="/admin/clientes" element={<ClienteAdmin />} />
				<Route path="/admin/devoluciones" element={<DevolucionesAdmin />} />
			</Route>

			{/* Usuario */}
			<Route
				path="/usuario/index"
				element={
					<ProtectedRoute requiredRole={2}>
						<UsuarioIndex />
					</ProtectedRoute>
				}
			/>
		</Routes>
	);
}

export default App;
