import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../../components/sideBar";
import GeneralTable from "../../../../components/GeneralTable";
import {proveedorService} from '../../../../service/proveedores.service'; 

const columns = [
  { header: "ID", accessor: "Id_Proveedores" },
  { header: "Tipo Proveedor", accessor: "Tipo_Proveedor" },
  { header: "Nombre / Empresa", accessor: "nombre" },
  { header: "Celular / Celular Empresa", accessor: "celular" },
  { header: "Email", accessor: "Email" },
  { header: "Estado", accessor: "Estado" },
];

const transformData = (data) => {
  return data.map(item => {
    const isEmpresa = item.Tipo_Proveedor === "Empresa";
    return {
      ...item,
      nombre: isEmpresa ? item.Nombre_Empresa : item.Nombre,
      celular: isEmpresa ? item.Celular_Empresa : item.Celular,
    };
  });
};

const Proveedores = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

const fetchData = async () => {
  try {
    const response = await proveedorService.obtenerProveedores();
    console.log(response);
    setData(transformData(response.data));
  } catch (error) {
    console.error("Error al obtener proveedores:", error.response?.data || error);
  }
};


const handleToggleEstado = async (id) => {
  try {
    await proveedorService.actualizarEstadoProveedor(id);
    await fetchData();
  } catch (error) {
    console.error('Error cambiando estado:', error.response?.data || error);
    alert('Error cambiando estado');
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    console.log("Agregar proveedor");
    navigate('/admin/proveedores/agregar');
  };

  const handleView = (row) => {
    console.log("Ver proveedor:", row);
  };

  const handleEdit = (row) => {
    console.log("Editar proveedor:", row);
  };

  const handleDelete = (row) => {
    console.log("Eliminar proveedor:", row);
  };

  return (
    <div className="flex">
      <Sidebar/>
      <div className="flex-1 md:ml-64 p-4 md:p-8">
        <GeneralTable
          title="Proveedores"
          columns={columns}
          data={data}
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleEstado={handleToggleEstado}
          idAccessor="Id_Proveedores"
          stateAccessor="Estado"
        />
      </div>
    </div>
  );
};

export default Proveedores;