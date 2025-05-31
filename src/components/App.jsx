import React from "react";
import { Route, Routes } from "react-router-dom";
import "../styles/css/App.css";

import CategoriaInsumoAdmin from "../pages/Admin/Compras/CategoriaInsumos/Index";
import CategoriasProducto from "../pages/Admin/Compras/CategoriaProductos/Index";
import AgregarCatProducto from "../pages/Admin/Compras/CategoriaProductos/AgregarCatProducto";
import EditarCatProducto from "../pages/Admin/Compras/CategoriaProductos/EditarCatProducto";
import CompraAdmin from "../pages/Admin/Compras/Compra/Index";
import InsumoAdmin from "../pages/Admin/Compras/Insumos/Index";
import ProductoAdmin from "../pages/Admin/Compras/Productos/Index";
import AgregarProveedor from "../pages/Admin/Compras/Proveedores/AgregarProveedor";
import EditarProveedor from "../pages/Admin/Compras/Proveedores/EditarProveedor";
import Proveedores from "../pages/Admin/Compras/Proveedores/Index";
import RolesAdmin from "../pages/Admin/Configuracion/Roles/Index";
import Dashboard from "../pages/Admin/Dashboard";
import AgendamientoAdmin from "../pages/Admin/Servicios/Agendamiento/Index";
import HorarioAdmin from "../pages/Admin/Servicios/Horarios/Index";
import ServicioAdmin from "../pages/Admin/Servicios/Servicio/Index";
import EmpleadoAdmin from "../pages/Admin/Usuarios/Empleados/Index";
import UsuarioAdmin from "../pages/Admin/Usuarios/Usuario/Index";
import UsuarioAgregar from '../pages/Admin/Usuarios/Usuario/Agregar'
import UsuarioEditar from '../pages/Admin/Usuarios/Usuario/Editar'
import ClienteAdmin from "../pages/Admin/Ventas/Clientes/Index";
import DevolucionesAdmin from "../pages/Admin/Ventas/Devoluciones/Index";
import VentaAdmin from "../pages/Admin/Ventas/Venta/Index";

import AuthForm from "../pages/Auth/AuthForm";
import RecoverPassword from "../pages/Auth/RCP";
import Home from "../pages/Landing/Home";
import UsuarioIndex from "../pages/Usuario/Index";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

function App() {
	return (
		<Routes>
			{/* Rutas públicas */}
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<AuthForm />} />
			<Route path="/rcp" element={<RecoverPassword />} />

			{/* Rutas privadas de usuario normal */}
			<Route
				path="/usuario/index"
				element={
					<ProtectedRoute requiredRole={2}>
						<UsuarioIndex />
					</ProtectedRoute>
				}
			/>

			{/* Rutas administrativas con Sidebar */}
			<Route
				path="/admin"
				element={
					<ProtectedRoute requiredRole={1}>
						<AdminLayout />
					</ProtectedRoute>
				}
			>
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="roles" element={<RolesAdmin />} />
				<Route path="usuario" element={<UsuarioAdmin />} />
				<Route path="usuario/agregar" element={<UsuarioAgregar />}/>
        		<Route path="usuario/editar/:id" element={<UsuarioEditar />}/>
				<Route path="empleado" element={<EmpleadoAdmin />} />
				<Route path="servicios" element={<ServicioAdmin />} />
				<Route path="agendamiento" element={<AgendamientoAdmin />} />
				<Route path="horarios" element={<HorarioAdmin />} />
				<Route path="compras" element={<CompraAdmin />} />
				<Route path="proveedores" element={<Proveedores />} />
				<Route path="proveedores/agregar" element={<AgregarProveedor />} />
				<Route path="proveedores/editar/:id" element={<EditarProveedor />} />
				<Route path="categoriaproducto" element={<CategoriasProducto />} />
				<Route path="categoriaproducto/agregar" element={<AgregarCatProducto />} />
				<Route path="categoriaproducto/editar/:id" element={<EditarCatProducto />} />
				<Route path="producto" element={<ProductoAdmin />} />
				<Route path="categoriainsumo" element={<CategoriaInsumoAdmin />} />
				<Route path="insumo" element={<InsumoAdmin />} />
				<Route path="ventas" element={<VentaAdmin />} />
				<Route path="clientes" element={<ClienteAdmin />} />
				<Route path="devoluciones" element={<DevolucionesAdmin />} />
			</Route>
		</Routes>
	);
}

export default App;
