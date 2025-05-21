import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Landing/Home'
import AuthForm from '../pages/Auth/AuthForm'
import RecoverPassword from '../pages/Auth/RCP'
import Dashboard from '../pages/Admin/Dashboard'
import UsuarioAdmin from '../pages/Admin/Usuario/Index'
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
      <Route path="/admin/usuario" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/empleado" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/servicios" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/agendamiento" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/horarios" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/compras" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/proveedores" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/categoriaproducto" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/producto" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/categoriainsumo" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/insumo" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/ventas" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/clientes" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>
      <Route path="/admin/devoluciones" element={<ProtectedRoute requiredRole={1}><UsuarioAdmin /></ProtectedRoute>}/>

      /usuario
      <Route path="/usuario/index" element={<ProtectedRoute requiredRole={2}> <UsuarioIndex /></ProtectedRoute>}/>
      
      
      </Routes>
  )
}

export default App
