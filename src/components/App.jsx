import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Landing/Home'
import '../styles/App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}

export default App
