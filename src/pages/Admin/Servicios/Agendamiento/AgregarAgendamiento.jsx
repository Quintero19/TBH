import { showAlert } from "@/components/AlertProvider";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/Buttons/Button";
import { agendamientoService } from "../../../../service/agendamientoService";

const AgregarAgendamiento = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    Id_Agendamientos: "",
    Id_Cliente: "",
    Id_Empleados: "",
    Fecha: "",
    Subtotal: "",
    Estado: true,
  });

  const isFormValid = () => {
    const requiredFields = ["Id_Cliente", "Id_Empleados", "Fecha", "Subtotal"];
    const allFieldsFilled = requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );
    const noErrors = Object.keys(errors).length === 0;
    return allFieldsFilled && noErrors;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "Id_Cliente":
      case "Id_Empleados":
        if (value.trim().length === 0) {
          newErrors[name] = "Este campo es requerido";
        } else if (!/^\d+$/.test(value)) {
          newErrors[name] = "Debe ser un número entero";
        } else {
          delete newErrors[name];
        }
        break;

      case "Fecha":
        if (!value) {
          newErrors[name] = "La fecha es requerida";
        } else {
          delete newErrors[name];
        }
        break;

      case "Subtotal":
        if (value.trim().length === 0) {
          newErrors[name] = "El subtotal es requerido";
        } else if (/[eE]/.test(value)) {
          newErrors[name] = "No se permite la notación científica (e)";
        } else if (Number.isNaN(Number(value)) || Number(value) <= 0) {
          newErrors[name] = "Debe ser un número mayor a 0";
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
    const updatedValue = type === "checkbox" ? checked : value;

    if ((name === "Subtotal") && value !== "" && Number.isNaN(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    validateField(name, updatedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ["Id_Cliente", "Id_Empleados", "Fecha", "Subtotal"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      const value = formData[field];
      validateField(field, value);
      if (!value || value.toString().trim() === "") {
        newErrors[field] = "Este campo es obligatorio";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showAlert(
        "Por favor completa todos los campos obligatorios y corrige los errores.",
        {
          type: "error",
          title: "Formulario incompleto",
          duration: 2500,
        }
      );
      return;
    }

    try {
      const payload = {
        ...formData,
        Subtotal: Number.parseFloat(formData.Subtotal),
      };

      await agendamientoService.crearAgendamiento(payload);
      showAlert("El agendamiento ha sido guardado correctamente.", {
        title: "¡Éxito!",
        type: "success",
        duration: 2000,
      }).then(() => {
        navigate("/admin/agendamientos");
      });
    } catch (error) {
      console.error("Error al agregar agendamiento:", error);
      showAlert("Error al agregar agendamiento", {
        type: "error",
        title: "Error",
        duration: 2000,
      });
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
        navigate("/admin/agendamientos");
      }
    });
  };

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">Agregar Agendamiento</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Cliente */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            ID Cliente <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Id_Cliente"
            value={formData.Id_Cliente}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.Id_Cliente && <p className="text-red-500 text-sm mt-1">{errors.Id_Cliente}</p>}
        </div>

        {/* ID Empleado */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            ID Empleado <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Id_Empleados"
            value={formData.Id_Empleados}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.Id_Empleados && <p className="text-red-500 text-sm mt-1">{errors.Id_Empleados}</p>}
        </div>

        {/* Fecha */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Fecha <span className="text-red-500">*</span>
          </h3>
          <input
            type="datetime-local"
            name="Fecha"
            value={formData.Fecha}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.Fecha && <p className="text-red-500 text-sm mt-1">{errors.Fecha}</p>}
        </div>

        {/* Subtotal */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Subtotal <span className="text-red-500">*</span>
          </h3>
          <input
            type="number"
            step="0.01"
            min="0"
            name="Subtotal"
            value={formData.Subtotal}
            onChange={(e) => {
              const value = e.target.value;
              const digitsOnly = value.replace(".", "");
              if (digitsOnly.length <= 6) {
                handleChange(e);
              }
            }}
            onKeyDown={(e) => {
              const allowedKeys = [
                "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                ".", "Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight"
              ];
              if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
              }
              if (e.key === "." && e.target.value.includes(".")) {
                e.preventDefault();
              }
            }}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.Subtotal && <p className="text-red-500 text-sm mt-1">{errors.Subtotal}</p>}
        </div>

        {/* Estado */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">Estado</h3>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="Estado"
              checked={formData.Estado}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">Activo</span>
          </label>
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex gap-2 ml-7">
          <Button
            type="submit"
            className="green"
            disabled={!isFormValid()}
            icon="fa-floppy-o"
          >
            <div className="flex items-center gap-2">Guardar</div>
          </Button>
          <Button
            type="button"
            className="red"
            onClick={handleCancel}
            icon="fa-times"
          >
            <div className="flex items-center gap-2">Cancelar</div>
          </Button>
        </div>
      </form>
    </>
  );
};

export default AgregarAgendamiento;