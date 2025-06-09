import React, { useState, useEffect } from "react";
import { FaSave } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "../../../../components/Buttons/Button";
import { empleadoService } from "../../../../service/empleado.service";

const EditarEmpleado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    Id_Empleados: "",
    Tipo_Documento: "",
    Documento: "",
    Nombre: "",
    Celular: "",
    F_Nacimiento: "",
    Direccion: "",
    Sexo: "",
    Estado: true,
  });

  useEffect(() => {
    const cargarEmpleado = async () => {
      try {
        const data = await empleadoService.obtenerEmpleadoPorId(id);
        const empleadoData = data.data;
        
        // Formatear fecha si existe
        if (empleadoData.F_Nacimiento) {
          empleadoData.F_Nacimiento = empleadoData.F_Nacimiento.split("T")[0];
        }
        
        setFormData(empleadoData);
      } catch (error) {
        console.error("Error al cargar empleado:", error);
        showAlert("Error al cargar el empleado", {
          type: "error",
          title: "Error",
          duration: 2000,
        });
        navigate("/admin/empleado");
      }
    };

    cargarEmpleado();
  }, [id, navigate]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "Nombre":
        newErrors[name] =
          value.trim().length > 0 && value.length < 3
            ? "Debe tener al menos 3 caracteres, sin números o caracteres especiales"
            : "";
        break;

      case "Documento":
        newErrors[name] =
          value.trim().length > 0 && !/^\d{10,12}$/.test(value)
            ? "Debe ser un documento entre 10 y 12 dígitos"
            : "";
        break;

      case "Celular":
        newErrors[name] =
          value.trim().length > 0 && !/^\d{9,11}$/.test(value)
            ? "Debe ser un número entre 9 y 11 dígitos"
            : "";
        break;
      case "F_Nacimiento":
        if (value) {
          const birthDate = new Date(value);
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 100);
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() - 18);

          if (birthDate < minDate || birthDate > maxDate) {
            newErrors[name] = "La edad debe estar entre 14 y 100 años";
          }
        }
        break;

      case "Sexo":
      case "Tipo_Documento":
        newErrors[name] = value.trim().length === 0 ? "Este campo es requerido" : "";
        break;

      default:
        break;
    }

    if (newErrors[name] === "") {
      delete newErrors[name];
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (["Documento", "Celular"].includes(name)) {
      const regex = /^\d*$/;
      if (!regex.test(value)) return;
    }

    if (name === "Nombre") {
      const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/;
      if (!regex.test(value)) return;
    }


    const updatedValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    validateField(name, updatedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["Tipo_Documento", "Documento", "Nombre", "Celular", "Sexo"];
    const newErrors = { ...errors };

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = "Este campo es requerido";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert("Por favor corrige los errores en el formulario", {
        type: "error",
        title: "Error",
        duration: 2000,
      });
      return;
    }

    try {
      await empleadoService.actualizarEmpleado(id, formData);
      showAlert("El empleado ha sido actualizado correctamente.", {
        title: "¡Éxito!",
        type: "success",
        duration: 2000,
      }).then(() => {
        navigate("/admin/empleado");
      });
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      showAlert("No se pudo actualizar el empleado: " + (error.message || "Error desconocido"), {
        type: "error",
        title: "Error",
        duration: 2000,
      });
    }
  };

  const handleCancel = () => {
    showAlert("Si cancelas, perderás los cambios realizados.", {
      title: "¿Estás seguro?",
      type: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar editando",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/empleado");
      }
    });
  };

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Editar Empleado
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 md:col-span-1">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Tipo de Documento <span className="text-red-500">*</span>
          </h3>
          <select
            name="Tipo_Documento"
            value={formData.Tipo_Documento}
            onChange={handleChange}
            required
            className={`w-full border border-gray-300 p-2 rounded ${errors.Tipo_Documento ? "border-red-500" : ""}`}
          >
            <option value="">Seleccione el Tipo</option>
            <option value="C.C">C.C - Cédula de Ciudadanía</option>
            <option value="C.E">C.E - Cédula de Extranjería</option>
          </select>
          {errors.Tipo_Documento && (
            <p className="text-red-500 text-sm mt-1">{errors.Tipo_Documento}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Documento <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Documento"
            value={formData.Documento}
            onChange={handleChange}
            maxLength={15}
            required
            className={`w-full border border-gray-300 p-2 rounded ${errors.Documento ? "border-red-500" : ""}`}
          />
          {errors.Documento && (
            <p className="text-red-500 text-sm mt-1">{errors.Documento}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Nombre <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Nombre"
            value={formData.Nombre}
            onChange={handleChange}
            maxLength={50}
            required
            className={`w-full border border-gray-300 p-2 rounded ${errors.Nombre ? "border-red-500" : ""}`}
          />
          {errors.Nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Celular <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Celular"
            value={formData.Celular}
            onChange={handleChange}
            maxLength={10}
            required
            className={`w-full border border-gray-300 p-2 rounded ${errors.Celular ? "border-red-500" : ""}`}
          />
          {errors.Celular && (
            <p className="text-red-500 text-sm mt-1">{errors.Celular}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Fecha de Nacimiento
          </h3>
          <input
            type="date"
            name="F_Nacimiento"
            value={formData.F_Nacimiento}
            onChange={handleChange}
            className={`w-full border border-gray-300 p-2 rounded ${errors.F_Nacimiento ? "border-red-500" : ""}`}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 14)).toISOString().split("T")[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
          />
          {errors.F_Nacimiento && (
            <p className="text-red-500 text-sm mt-1">{errors.F_Nacimiento}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Dirección
          </h3>
          <input
            type="text"
            name="Direccion"
            value={formData.Direccion}
            onChange={handleChange}
            maxLength={100}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2 block">
            Sexo <span className="text-red-500">*</span>
          </h3>
          <select
            name="Sexo"
            value={formData.Sexo}
            onChange={handleChange}
            required
            className={`w-full border border-gray-300 p-2 rounded ${errors.Sexo ? "border-red-500" : ""}`}
          >
            <option value="">Seleccione...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.Sexo && (
            <p className="text-red-500 text-sm mt-1">{errors.Sexo}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2 flex items-center gap-3">
          <label className="text-xl font-semibold text-black">Estado</label>
          <input
            type="checkbox"
            name="Estado"
            checked={formData.Estado}
            onChange={handleChange}
            className="w-5 h-5"
          />
        </div>

        <div className="flex justify-end gap-4 md:col-span-2 px-7 mb-5">
          <Button 
            type="submit" 
            className="green"
            disabled={Object.keys(errors).length > 0}
          >
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

export default EditarEmpleado;