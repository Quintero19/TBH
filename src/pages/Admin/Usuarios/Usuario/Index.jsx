import {userService} from '../../../../service/usuario.service'; 
import React, { useEffect, useState } from 'react';
import Sidebar from '../../../../components/sideBar';
import GeneralTable from '../../../../components/GeneralTable';


export default function Usuario() {
  const title = 'Usuarios';

  const columns = [
    { header: 'documento', accessor: 'Documento' },
    { header: 'correo', accessor: 'Correo' },
    { header: 'estado', accessor: 'Estado' },
  ];


  const [usuarios, setUsuarios] = useState([]);

  const obtenerUsuarios = async () => {
  try {
    const response = await userService.listarUsuarios();
    console.log('Respuesta cruda del backend:', response);

    const usuariosBackend = response.data; 

    const normalizado = usuariosBackend.map((usuario) => ({
      Documento: usuario.Documento,
      Correo: usuario.Correo,
      Estado: usuario.Estado,
    }));


    setUsuarios(normalizado);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
  }
};


  const eliminarUsuario = async (usuario) => {
    try {
      await userService.eliminarUsuario(usuario.documento);
      obtenerUsuarios(); // Refresca la tabla después de eliminar
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  return (
    <>
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <GeneralTable
          title={title}
          columns={columns}
          data={usuarios}
          onAdd={() => console.log('Agregar')}
          onView={(row) => console.log('Ver', row)}
          onEdit={(row) => console.log('Editar', row)}
          onDelete={(row) => eliminarUsuario(row)}
        />
      </div>
    </>
  );
}

