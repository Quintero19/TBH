import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/sideBar';

export default function Dashboard() {
  const navigate = useNavigate();

  <div>
    <SidebarLayout />
  </div>

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div>
      <h1>Bienvenido al Dashboard</h1>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}
