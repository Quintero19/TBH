import { showAlert } from "@/components/AlertProvider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Buttons/Button";
import { empleadoService } from "@/service/empleado.service";

const AgregarEmpleado = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    Tipo_Documento: "",
    Documento: "",
    Nombre: "",
    Celular: "",
    F_Nacimiento: "",
    Direccion: "",
    Sexo: "",
    Estado: true,
  });

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "Nombre":
        if (!value.trim()) {
          newErrors[name] = "Ningun campo sera valido mientras se comience con la tecla espacio";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(value)) {
          newErrors[name] = "Nombre inválido (3-50 letras)";
        } else {
          delete newErrors[name];
        }
        break;

      case "Documento":
        if (!value.trim()) {
          newErrors[name] = "Ningun campo sera valido mientras se comience con la tecla espacio";
        } else if (!/^\d{8,12}$/.test(value)) {
          newErrors[name] = "Documento inválido (8-12 dígitos)";
        } else {
          delete newErrors[name];
        }
        break;

      case "Celular":
        if (!value.trim()) {
          newErrors[name] = "Ningun campo sera valido mientras se comience con la tecla espacio";
        } else if (!/^\d{10,11}$/.test(value)) {
          newErrors[name] = "Celular inválido (10-11 dígitos)";
        } else {
          delete newErrors[name];
        }
        break;

      case "F_Nacimiento":
        if (!value) {
          newErrors[name] = "Requerido";
        } else {
          const fecha = new Date(value);
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 100);
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() - 18);

          if (fecha < minDate || fecha > maxDate) {
            newErrors[name] = "Edad debe ser 18-100 años";
          } else {
            delete newErrors[name];
          }
        }
        break;

      case "Tipo_Documento":
      case "Sexo":
        if (!value) {
          newErrors[name] = "Requerido";
        } else {
          delete newErrors[name];
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    Object.keys(formData).forEach(field => {
      if (field !== "Direccion") { 
        validateField(field, formData[field]);
      }
    });

    if (Object.keys(errors).length > 0) {
      showAlert("Corrija los errores en el formulario", {
        type: "error",
        title: "Error de validación"
      });
      setSubmitting(false);
      return;
    }

    try {
      await empleadoService.crearEmpleado(formData);
      showAlert("Empleado creado exitosamente", {
        type: "success",
        title: "Éxito"
      });
      navigate("/admin/empleado");
    } catch (error) {
      console.error("Error al crear empleado:", error);
      const msg = error.response?.data?.message || "Error al crear empleado";
      showAlert(msg, { type: "error", title: "Error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    showAlert("Si cancelas, perderás los datos ingresados.", {
      title: "¿Estás seguro?",
      type: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/empleado");
      }
    });
  };
  const isFormValid = () => {
    const requiredFields = ["Tipo_Documento", "Documento", "Nombre", "Celular", "F_Nacimiento", "Sexo"];
    return requiredFields.every((field) => formData[field].trim?.() || formData[field]) && Object.keys(errors).length === 0;
  };
  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Agregar Empleado
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Tipo de Documento <span className="text-red-500">*</span>
          </h3>
          <select
            name="Tipo_Documento"
            value={formData.Tipo_Documento}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.Tipo_Documento ? "border-red-500" : "border-gray-300"} rounded`}
            required
          >
            <option value="">Seleccione...</option>
            <option value="C.C">Cédula de Ciudadanía</option>
            <option value="C.E">Cédula de Extranjería</option>
          </select>
          {errors.Tipo_Documento && (
            <p className="text-red-500 text-sm mt-1">{errors.Tipo_Documento}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Documento <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Documento"
            value={formData.Documento}
            onChange={handleChange}
            maxLength={12}
            className={`w-full p-2 border ${errors.Documento ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Documento && (
            <p className="text-red-500 text-sm mt-1">{errors.Documento}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Nombre"
            value={formData.Nombre}
            onChange={handleChange}
            maxLength={50}
            className={`w-full p-2 border ${errors.Nombre ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
          )}
        </div>

        {/* Celular */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Celular <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Celular"
            value={formData.Celular}
            onChange={handleChange}
            maxLength={11}
            className={`w-full p-2 border ${errors.Celular ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Celular && (
            <p className="text-red-500 text-sm mt-1">{errors.Celular}</p>
          )}
        </div>

        {/* Fecha Nacimiento */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Fecha Nacimiento <span className="text-red-500">*</span>
          </h3>
          <input
            type="date"
            name="F_Nacimiento"
            value={formData.F_Nacimiento}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.F_Nacimiento ? "border-red-500" : "border-gray-300"} rounded`}
            max={new Date().toISOString().split("T")[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
            required
          />
          {errors.F_Nacimiento && (
            <p className="text-red-500 text-sm mt-1">{errors.F_Nacimiento}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">Dirección</h3>
          <input
            type="text"
            name="Direccion"
            value={formData.Direccion}
            onChange={handleChange}
            maxLength={100}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Sexo */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Sexo <span className="text-red-500">*</span>
          </h3>
          <select
            name="Sexo"
            value={formData.Sexo}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.Sexo ? "border-red-500" : "border-gray-300"} rounded`}
            required
          >
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {errors.Sexo && (
            <p className="text-red-500 text-sm mt-1">{errors.Sexo}</p>
          )}
        </div>

        <div className="md:col-span-2 flex gap-2 ml-7">
          <Button
        type="submit"
        className={`green ${(!isFormValid() || submitting) ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!isFormValid() || submitting}
        loading={submitting}
        icon="fa-floppy-o"
      >
        <div className="flex items-center gap-2">Guardar</div>
      </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="red"
            disabled={submitting}
            icon="fa-times"
          >
            <div className="flex items-center gap-2">Cancelar</div>
          </Button>
          

        </div>
      </form>
    </>
  );
};

export default AgregarEmpleado;
