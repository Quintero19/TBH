import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Landing/Home'
import AuthForm from '../pages/Auth/AuthForm'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthForm />} />
      </Routes>
    </>
  )
}

export default App
