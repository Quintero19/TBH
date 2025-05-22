import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/sideBar';

export default function Usuario() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout/', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
          <h1>Bienvenido al Usuario</h1>
          <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
    </> 
  );
}
