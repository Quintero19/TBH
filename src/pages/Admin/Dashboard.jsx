import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/sideBar';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout/', {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div>
      <Sidebar />
      <h1>Bienvenido al Dashboard</h1>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}
