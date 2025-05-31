import React, { useState,useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { userService } from "../../../../service/usuario.service";
import { rolService } from "../../../../service/roles.service";

export default function AgregarUsuario () {
  const navigate = useNavigate();
  
  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({
    Documento: "",
    Correo: "",
    Password: "",
    confirmPassword: "",
    Rol_Id: "",
    Estado: ""
  });

  useEffect(() => {
        const fetchRoles = async () => {
          try {
            const response = await rolService.listarRoles();
            const rolesArray = response.data;

            if (Array.isArray(rolesArray)) {
              // Filtra los roles activos
              const rolesActivos = rolesArray.filter(rol => rol.Estado === true);
              setRoles(rolesActivos);
            } else {
              console.error("La propiedad data no es un array:", rolesArray);
            }
          } catch (error) {
            console.error("Error al obtener roles:", error);
          }
        };

        fetchRoles();
      }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;

    let val = value;

     if (name === "Estado") {
        val = value === "true";
    }
    setFormData({
      ...formData,
      [name]: val,
    });
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.Password !== formData.confirmPassword) {
          Swal.fire({
            title: "Error",
            text: "Las contraseñas no coinciden.",
            icon: "error",
            background: '#000',
            color: '#fff'
          });
          return;
        }

        try {
          const usuarioFinal = {
            ...formData,
            Rol_Id: Number(formData.Rol_Id), 
          };
          delete usuarioFinal.confirmPassword;

          await userService.crearUsuario(usuarioFinal);

          Swal.fire({
            title: "¡Éxito!",
            text: "El usuario ha sido guardado correctamente.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            background: '#000',
            color: '#fff'
          }).then(() => {
            navigate("/admin/usuario");
          });

        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.message || "Ocurrió un error al guardar el usuario.",
            icon: "error",
            confirmButtonText: "Aceptar",
            background: '#000',
            color: '#fff'
          });
        }
      };



  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Si cancelas, perderás los datos ingresados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, continuar",
      background: '#000',  
      color : '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/usuario");
      }
    });
  };

  return (
    <div className="flex">
    <div className="grow p-6">
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">Agregar Usuario</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">Documento <span className="text-red-500">*</span></h3>
          <input
            type="number"
            name="Documento"
            value={formData.Documento}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">Correo <span className="text-red-500">*</span></h3>
          <input
            type="email"
            name="Correo"
            value={formData.Correo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">Contraseña <span className="text-red-500">*</span></h3>
          <input
            type="password"
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">Confirmar Contraseña <span className="text-red-500">*</span></h3>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">Rol <span className="text-red-500">*</span></h3>
          <select
                name="Rol_Id"
                value={formData.Rol_Id}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Selecciona un rol</option>
                {Array.isArray(roles) && roles.map((rol) => (
                  <option key={rol.Id} value={rol.Id}>
                    {rol.Nombre}
                  </option>
                ))}
        </select>
        </div>


      <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
        <h3 className="text-2xl text-black font-bold mb-2 block">Estado <span className="text-red-500">*</span></h3>
        <select
          name="Estado"
          value={formData.Estado}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona estado</option>
          <option value={true}>Activo</option>
          <option value={false}>Inactivo</option>
        </select>
      </div>


        <div className="md:col-span-2 flex gap-2 ml-7">
          <Button className="green" type="submit"> Guardar</Button>
          <Button className="red" onClick={handleCancel}> Cancelar</Button>
        </div>
      </form>
    </div>
    </div>
  );
};
