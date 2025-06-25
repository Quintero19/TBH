import { showAlert } from "@/components/AlertProvider";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Buttons/Button";
import { horariosService } from "@/service/horarios.service";
import { empleadoService } from "@/service/empleado.service";

const AgregarNovedadHorario = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  const [formData, setFormData] = useState({
    Id_Empleados: "",
    Fecha: "",
    Hora_Inicio: "",
    Hora_Fin: "",
    Motivo: "",
  });

  // Mover la validación del rango de tiempo a un useCallback
  const validateTimeRange = useCallback(() => {
    if (formData.Hora_Inicio && formData.Hora_Fin) {
      const inicio = new Date(`2000-01-01T${formData.Hora_Inicio}`);
      const fin = new Date(`2000-01-01T${formData.Hora_Fin}`);
      
      if (inicio >= fin) {
        setErrors(prev => ({
          ...prev,
          Hora_Fin: "La hora final debe ser mayor a la hora inicial"
        }));
        return false;
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.Hora_Fin;
          return newErrors;
        });
        return true;
      }
    }
    return true;
  }, [formData.Hora_Inicio, formData.Hora_Fin]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        setLoadingEmpleados(true);
        const response = await empleadoService.obtenerEmpleadosActivos();
        
        let empleadosData = [];
        
        if (Array.isArray(response)) {
          empleadosData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          empleadosData = response.data;
        } else if (response?.empleados && Array.isArray(response.empleados)) {
          empleadosData = response.empleados;
        }

        setEmpleados(empleadosData);
        
        if (empleadosData.length === 0) {
          showAlert("No se encontraron empleados activos", {
            type: "warning",
            title: "Advertencia"
          });
        }
      } catch (error) {
        console.error("Error al obtener empleados:", error);
        showAlert("Error al cargar la lista de empleados", {
          type: "error",
          title: "Error"
        });
        setEmpleados([]);
      } finally {
        setLoadingEmpleados(false);
      }
    };
    
    fetchEmpleados();
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "Id_Empleados":
        if (!value) {
          newErrors[name] = "Seleccione un empleado";
        } else {
          delete newErrors[name];
        }
        break;

      case "Fecha":
        if (!value) {
          newErrors[name] = "Seleccione una fecha";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            newErrors[name] = "La fecha no puede ser anterior al día actual";
          } else {
            delete newErrors[name];
          }
        }
        break;

      case "Hora_Inicio":
      case "Hora_Fin":
        if (!value) {
          newErrors[name] = "Seleccione una hora";
        } else {
          delete newErrors[name];
        }
        break;

      case "Motivo":
        if (!value.trim()) {
          newErrors[name] = "El motivo no puede estar vacío";
        } else if (value.trim().length > 100) {
          newErrors[name] = "El motivo no puede exceder 100 caracteres";
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
    
    // Validar rango de horas solo cuando ambos campos están completos
    if ((name === "Hora_Inicio" || name === "Hora_Fin") && formData.Hora_Inicio && formData.Hora_Fin) {
      validateTimeRange();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validar todos los campos
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

    // Validar rango de horas
    const isTimeValid = validateTimeRange();

    if (Object.keys(errors).length > 0 || !isTimeValid) {
      showAlert("Corrija los errores en el formulario", {
        type: "error",
        title: "Error de validación"
      });
      setSubmitting(false);
      return;
    }

    try {
      const datosEnviar = {
        ...formData,
        Fecha: new Date(formData.Fecha).toISOString().split('T')[0]
      };

      await horariosService.crearNovedadHorario(datosEnviar);
      showAlert("Novedad de horario creada exitosamente", {
        type: "success",
        title: "Éxito"
      });
      navigate("/admin/novedades-horarios");
    } catch (error) {
      console.error("Error al crear novedad de horario:", error);
      showAlert("Error al crear novedad de horario", { 
        type: "error", 
        title: "Error" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasData = Object.values(formData).some(value => value !== "" && value !== null);
    
    if (!hasData) {
      navigate("/admin/horarios");
      return;
    }

    showAlert("Si cancelas, perderás los datos ingresados.", {
      title: "¿Estás seguro?",
      type: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/horarios");
      }
    });
  };

  const isFormValid = () => {
    const requiredFields = ["Id_Empleados", "Fecha", "Hora_Inicio", "Hora_Fin", "Motivo"];
    const fieldsValid = requiredFields.every(field => formData[field]);
    const noErrors = Object.keys(errors).length === 0;
    
    return fieldsValid && noErrors;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
        Agregar Novedad de Horario
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md">
        {/* Empleado */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Empleado <span className="text-red-500">*</span>
          </label>
          
          {loadingEmpleados ? (
            <div className="animate-pulse p-3 bg-gray-200 rounded-lg">
              Cargando empleados...
            </div>
          ) : (
            <>
              <select
                name="Id_Empleados"
                value={formData.Id_Empleados}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.Id_Empleados ? "border-red-500" : "border-gray-300"
                }`}
                required
                disabled={empleados.length === 0}
              >
                <option value="">Seleccione un empleado...</option>
                {empleados.map(empleado => (
                  <option key={empleado.Id_Empleados} value={empleado.Id_Empleados}>
                    {empleado.Nombre} - {empleado.Documento}
                  </option>
                ))}
              </select>
              {errors.Id_Empleados && (
                <p className="text-red-500 text-sm mt-1">{errors.Id_Empleados}</p>
              )}
            </>
          )}
        </div>

        {/* Fecha */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="Fecha"
            value={formData.Fecha}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.Fecha ? "border-red-500" : "border-gray-300"
            }`}
            min={new Date().toISOString().split("T")[0]}
            required
          />
          {errors.Fecha && (
            <p className="text-red-500 text-sm mt-1">{errors.Fecha}</p>
          )}
        </div>

        {/* Hora Inicio */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Hora Inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="Hora_Inicio"
            value={formData.Hora_Inicio}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.Hora_Inicio ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.Hora_Inicio && (
            <p className="text-red-500 text-sm mt-1">{errors.Hora_Inicio}</p>
          )}
        </div>

        {/* Hora Fin */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Hora Fin <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="Hora_Fin"
            value={formData.Hora_Fin}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.Hora_Fin ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.Hora_Fin && (
            <p className="text-red-500 text-sm mt-1">{errors.Hora_Fin}</p>
          )}
        </div>

        {/* Motivo */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-lg font-semibold text-gray-700">
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            name="Motivo"
            value={formData.Motivo}
            onChange={handleChange}
            maxLength={100}
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.Motivo ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describa el motivo de la novedad..."
            required
          />
          <div className="flex justify-between items-center">
            {errors.Motivo && (
              <p className="text-red-500 text-sm">{errors.Motivo}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {formData.Motivo.length}/100 caracteres
            </p>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
          <Button
            type="button"
            onClick={handleCancel}
            className="red"
            disabled={submitting}
            icon="fa-times"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className={`green ${(!isFormValid() || submitting) ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid() || submitting}
            loading={submitting ? "true" : undefined}
            icon="fa-floppy-o"
          >
            Guardar Novedad
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgregarNovedadHorario;