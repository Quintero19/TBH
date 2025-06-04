import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import Sidebar from "../../../../components/sideBar";
import { servicioService } from "../../../../service/serviciosService";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const EditarServicios = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Nombre: "",
    Precio: "",
    Duracion: "",
    Descripcion: "",
  });

  useEffect(() => {
    const cargarServicio = async () => {
      try {
        const servicioData = await servicioService.obtenerServicioPorId(id);

        // Validación de datos
        if (!servicioData || typeof servicioData !== "object") {
          throw new Error("Formato de datos inválido");
        }

        // Llenamos el formulario
        setFormData({
          Nombre: servicioData.Nombre || "",
          Precio: servicioData.Precio || "",
          Duracion: servicioData.Duracion || "",
          Descripcion: servicioData.Descripcion || "",
        });
      } catch (error) {
        console.error("Error al cargar servicio:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar el servicio",
          icon: "error",
          background: "#000",
          color: "#fff",
        });
        navigate("/admin/servicios");
      }
    };

    cargarServicio();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await servicioService.actualizarServicio(id, formData);
      Swal.fire({
        title: "¡Éxito!",
        text: "El servicio ha sido actualizado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#000",
        color: "#fff",
      }).then(() => {
        navigate("/admin/servicios");
      });
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el servicio.",
        icon: "error",
        background: "#000",
        color: "#fff",
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Si cancelas, perderás los cambios realizados.",
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
        Editar Servicio
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
            maxLength={100}
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
    </>
  );
};

export default EditarServicios;






