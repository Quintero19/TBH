import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import Sidebar from "../../../../components/sideBar";
import { servicioService } from "../../../../service/serviciosService";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const AgregarServicio = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Nombre: "",
    Precio: "",
    Duracion: "",
    Descripcion: "",
    Estado: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.Nombre ||
      !formData.Precio ||
      !formData.Duracion ||
      !formData.Descripcion
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
        background: "#000",
        color: "#fff",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        Precio: parseFloat(formData.Precio),
        Duracion: parseInt(formData.Duracion),
      };

      await servicioService.crearServicio(payload);
      Swal.fire({
        title: "¡Éxito!",
        text: "El servicio ha sido guardado correctamente.",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
        background: "#000",
        color: "#fff",
      }).then(() => {
        navigate("/admin/servicios");
      });
    } catch (error) {
      console.error("Error al agregar servicio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al agregar el servicio.",
        background: "#000",
        color: "#fff",
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
      background: "#000",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/servicios");
      }
    });
  };

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Agregar Servicio
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Nombre <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Nombre"
            value={formData.Nombre}
            onChange={handleChange}
            maxLength={50}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Precio <span className="text-red-500">*</span>
          </h3>
          <input
            type="number"
            step="0.01"
            min="0"
            name="Precio"
            value={formData.Precio}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Duración (min) <span className="text-red-500">*</span>
          </h3>
          <input
            type="number"
            name="Duracion"
            value={formData.Duracion}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Descripción <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Descripcion"
            value={formData.Descripcion}
            onChange={handleChange}
            maxLength={50}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-end gap-4 md:col-span-2 px-7 mb-5">
          <Button type="submit" className="green">
            <div className="flex items-center gap-2">
              <FaSave />
              Guardar
            </div>
          </Button>

          <Button type="button" className="red" onClick={handleCancel}>
            <div className="flex items-center gap-2">
              <IoClose />
              Cancelar
            </div>
          </Button>
        </div>
      </form>

      <Sidebar />
    </>
  );
};

export default AgregarServicio;




