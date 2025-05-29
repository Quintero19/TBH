
import {userService} from '../../../../service/usuario.service'; 
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import Sidebar from "../../../../components/sideBar";
import { userService } from "../../../../service/usuario.service";

export default function Usuario() {

  const navigate = useNavigate();

  const title = 'Usuarios';

	const columns = [
		{ header: "Documento", accessor: "Documento" },
		{ header: "Correo", accessor: "Correo" },
		{ header: "Estado", accessor: "Estado" },
	];

	const [usuarios, setUsuarios] = useState([]);

	const obtenerUsuarios = useCallback(async () => {
		try {
			const response = await userService.listarUsuarios();
			console.log("Respuesta cruda del backend:", response);

  const obtenerUsuarios = async () => {
  try {
    const response = await userService.listarUsuarios();


			const normalizado = usuariosBackend.map((usuario) => ({
				Documento: usuario.Documento,
				Correo: usuario.Correo,
				Estado: usuario.Estado,
				Id_Usuario: usuario.Id_Usuario,
				Rol_Id: usuario.Rol_Id,
			}));

			setUsuarios(normalizado);
		} catch (error) {
			console.error("Error al obtener los usuarios:", error);
		}
	}, []);

	const eliminarUsuario = async (usuario) => {
		try {
			await userService.eliminarUsuario(usuario.Documento);
			await obtenerUsuarios();
		} catch (error) {
			console.error("Error al eliminar el usuario:", error);
		}
	};

	useEffect(() => {
		obtenerUsuarios();
	}, [obtenerUsuarios]);

  const refreshUsuarios = () => {
      setUsuarios(obtenerUsuarios());
    };

  const editarUsuarios = (usuario) => {
    console.log("Usuario a editar:", usuario);
    navigate(`/admin/usuario/editar/${usuario.Documento}`)
  }
  const handleDelete = (usuario) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: '#000',  
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarUsuario(usuario);
        refreshUsuarios();
        Swal.fire({
          title: "Eliminado",
          text: "El usuario ha sido eliminado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: '#000', 
          color: '#fff', 
        }); 
      }
    });
  };

  const eliminarUsuario = async (usuario) => {
    try {
      await userService.eliminarUsuario(usuario.Documento);
      obtenerUsuarios();
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleVerDetalles = (usuario)  =>{
    Swal.fire({
      title: "Detalles Del Usuario",
      html: `
        <div class="text-left">
              <p><strong>Id:</strong> ${usuario.Id_Usuario}</p>
              <p><strong>Documento:</strong> ${usuario.Documento}</p>
              <p><strong>Email:</strong> ${usuario.Correo}</p>
              <p><strong>Estado:</strong> ${usuario.Estado}</p>
              <p><strong>Rol:</strong> ${usuario.Rol_Id}</p>
        </div>
      `,
			icon: "info",
			confirmButtonText: "Cerrar",
			padding: "1rem",
			confirmButtonColor: "#3085d6",
			background: "#000",
			color: "#fff",
		});
	};

  return (
    <>
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <GeneralTable
          title={title}
          columns={columns}
          data={usuarios}
          onAdd={() => navigate("/admin/usuario/agregar")}
          onView={handleVerDetalles}
          onEdit={editarUsuarios}
          onDelete={(handleDelete)}
        />
      </div>
    </>
  );

}
