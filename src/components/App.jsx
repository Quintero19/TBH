import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Landing/Home'
import AuthForm from '../pages/Auth/AuthForm'
import RecoverPassword from '../pages/Auth/RCP'
import Dashboard from '../pages/Admin/Dashboard'

function App() {

  return (
    <>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/rcp" element={<RecoverPassword />} />

        // Administrador

        <Route path="/admin/dashboard" element={<Dashboard />} />

        
        // Usuario





      </Routes>
    </>
  )
}

export default App
