import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Landing/Home'
import AuthForm from '../pages/Auth/AuthForm'
import RecoverPassword from '../pages/Auth/RCP'
import Dashboard from '../pages/Admin/Dashboard'

import RolesAdmin from '../pages/Admin/Configuracion/Roles/Index'
import UsuarioAdmin from '../pages/Admin/Usuarios/Usuario/Index'
import EmpleadoAdmin from '../pages/Admin/Usuarios/Empleados/Index'
import ServicioAdmin from '../pages/Admin/Servicios/Servicio/Index'
import AgendamientoAdmin from '../pages/Admin/Servicios/Agendamiento/Index'
import HorarioAdmin from '../pages/Admin/Servicios/Horarios/Index'
import CompraAdmin from '../pages/Admin/Compras/Compra/Index'
import ProveedoresAdmin from '../pages/Admin/Compras/Proveedores/Index'
import CategoriaProductoAdmin from '../pages/Admin/Compras/CategoriaProductos/Index'
import ProductoAdmin from '../pages/Admin/Compras/Productos/Index'
import CategoriaInsumoAdmin from '../pages/Admin/Compras/CategoriaInsumos/Index'
import InsumoAdmin from '../pages/Admin/Compras/Insumos/Index'
import VentaAdmin from '../pages/Admin/Ventas/Venta/Index'
import ClienteAdmin from '../pages/Admin/Ventas/Clientes/Index'
import DevolucionesAdmin from '../pages/Admin/Ventas/Devoluciones/Index'

import UsuarioIndex from '../pages/Usuario/Index'
import ProtectedRoute from '../components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<AuthForm />} />
      <Route path="/rcp" element={<RecoverPassword />} />

      //admin
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole={1}><Dashboard /></ProtectedRoute>}/>
      <Route path="/admin/roles" element={<ProtectedRoute requiredRole={1}><RolesAdmin /></ProtectedRoute>}/>
      <Route path="/admin/usuario" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/empleado" element={<ProtectedRoute requiredRole={1}><EmpleadoAdmin /></ProtectedRoute>}/>
      <Route path="/admin/servicios" element={<ProtectedRoute requiredRole={1}><ServicioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/agendamiento" element={<ProtectedRoute requiredRole={1}><AgendamientoAdmin /></ProtectedRoute>}/>
      <Route path="/admin/horarios" element={<ProtectedRoute requiredRole={1}><HorarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/compras" element={<ProtectedRoute requiredRole={1}><CompraAdmin /></ProtectedRoute>}/>
      <Route path="/admin/proveedores" element={<ProtectedRoute requiredRole={1}><ProveedoresAdmin /></ProtectedRoute>}/>
      <Route path="/admin/categoriaproducto" element={<ProtectedRoute requiredRole={1}><CategoriaProductoAdmin /></ProtectedRoute>}/>
      <Route path="/admin/producto" element={<ProtectedRoute requiredRole={1}><ProductoAdmin /></ProtectedRoute>}/>
      <Route path="/admin/categoriainsumo" element={<ProtectedRoute requiredRole={1}><CategoriaInsumoAdmin /></ProtectedRoute>}/>
      <Route path="/admin/insumo" element={<ProtectedRoute requiredRole={1}><InsumoAdmin /></ProtectedRoute>}/>
      <Route path="/admin/ventas" element={<ProtectedRoute requiredRole={1}><VentaAdmin /></ProtectedRoute>}/>
      <Route path="/admin/clientes" element={<ProtectedRoute requiredRole={1}><ClienteAdmin /></ProtectedRoute>}/>
      <Route path="/admin/devoluciones" element={<ProtectedRoute requiredRole={1}><DevolucionesAdmin /></ProtectedRoute>}/>

      /usuario
      <Route path="/usuario/index" element={<ProtectedRoute requiredRole={2}> <UsuarioIndex /></ProtectedRoute>}/>
      
      
      </Routes>
  )
}

export default App
