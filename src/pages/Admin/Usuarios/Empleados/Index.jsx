import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/sideBar';
import React from 'react';
import GeneralTable from '../../../../components/GeneralTable';

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
  const title = 'Empleados';

  const columns = [
    { header: 'Documento', accessor: 'documento' },
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Apellido', accessor: 'apellido' },
    { header: 'Correo', accessor: 'correo' },
    { header: 'HOla', accessor: 'estado' },
  ];

  const data = [];

  return (
    <>
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <GeneralTable
          title = {title}
          columns={columns}
          data={data}
          onAdd={() => console.log('Agregar')}
          onView={(row) => console.log('Ver', row)}
          onEdit={(row) => console.log('Editar', row)}
          onDelete={(row) => console.log('Eliminar', row)}
        />
      </div>
    </>
  );
}
