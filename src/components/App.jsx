import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Landing/Home'
import AuthForm from '../pages/Auth/AuthForm'
import RecoverPassword from '../pages/Auth/RCP'
import Dashboard from '../pages/Admin/Dashboard'
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

      /usuario
      <Route path="/usuario/index" element={<ProtectedRoute requiredRole={2}> <UsuarioIndex /></ProtectedRoute>}/>
      
      
      </Routes>
  )
}

export default App
