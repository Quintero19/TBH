import { showAlert } from "@/components/AlertProvider";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Buttons/Button";
import { horariosService } from "@/service/horarios.service";

const EditarNovedadHorario = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    Id_Empleados: "",
    Fecha: "",
    Hora_Inicio: "",
    Hora_Fin: "",
    Motivo: "",
  });
  const [errors, setErrors] = useState({});
  const [editable, setEditable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const validateTimeRange = useCallback(() => {
    const { Hora_Inicio, Hora_Fin } = formData;
    if (Hora_Inicio && Hora_Fin) {
      const inicio = new Date(`2000-01-01T${Hora_Inicio}`);
      const fin = new Date(`2000-01-01T${Hora_Fin}`);
      if (inicio >= fin) {
        setErrors(prev => ({ ...prev, Hora_Fin: "La hora final debe ser mayor a la hora inicial" }));
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
  }, [formData]);

  useEffect(() => {
    const fetchNovedad = async () => {
      try {
        const res = await horariosService.obtenerNovedadPorId(id);
        const novedad = res.data;

        setFormData({
          Id_Empleados: novedad.Id_Empleados,
          Fecha: novedad.Fecha,
          Hora_Inicio: novedad.Hora_Inicio,
          Hora_Fin: novedad.Hora_Fin,
          Motivo: novedad.Motivo,
        });

        // Verificar si se puede editar (3 horas antes)
        const fechaHora = new Date(`${novedad.Fecha}T${novedad.Hora_Inicio}`);
        const ahora = new Date();
        const tresHoras = 3 * 60 * 60 * 1000;

        if (fechaHora - ahora < tresHoras) {
          showAlert("No se puede modificar la novedad porque faltan menos de 3 horas para la hora de inicio.", {
            type: "warning",
            title: "Restricción de Edición"
          });
          setEditable(false);
        }

      } catch (error) {
        console.error("Error al obtener la novedad:", error);
        showAlert("Error al cargar la novedad", { type: "error", title: "Error" });
      }
    };

    fetchNovedad();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);

    if ((name === "Hora_Inicio" || name === "Hora_Fin") && formData.Hora_Inicio && formData.Hora_Fin) {
      validateTimeRange();
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
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
        } else if (/^[\s.,;:!?¿¡()\-]/.test(value)) {
          newErrors[name] = "El motivo no puede comenzar con espacios ni símbolos";
        } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,()¿?¡!:"'-]{3,100}$/.test(value)) {
          newErrors[name] = "Motivo inválido: solo se permiten letras, números y algunos signos comunes";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });

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

      await horariosService.actualizarNovedadHorario(id, datosEnviar);
      showAlert("Novedad actualizada exitosamente", {
        type: "success",
        title: "Éxito"
      });
      navigate("/admin/horarios");
    } catch (error) {
      console.error("Error al actualizar novedad:", error);
      const msg = error.response?.data?.message || "Error al actualizar novedad";
      showAlert(msg, { type: "error", title: "Error" });
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

    showAlert("Si cancelas, perderás los cambios realizados.", {
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
    const requiredFields = ["Fecha", "Hora_Inicio", "Hora_Fin", "Motivo"];
    const fieldsValid = requiredFields.every(field => formData[field]);
    const noErrors = Object.keys(errors).length === 0;

    return fieldsValid && noErrors && editable;
  };

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Editar Novedad de Horario
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Empleado (solo lectura) */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Empleado
          </h3>
          <input
            type="text"
            value={formData.Id_Empleados}
            disabled
            className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          />
        </div>

        {/* Fecha */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Fecha <span className="text-red-500">*</span>
          </h3>
          <input
            type="date"
            name="Fecha"
            value={formData.Fecha}
            onChange={handleChange}
            disabled={!editable}
            className={`w-full p-2 border ${errors.Fecha ? "border-red-500" : "border-gray-300"} rounded`}
            min={new Date().toISOString().split("T")[0]}
            required
          />
          {errors.Fecha && (
            <p className="text-red-500 text-sm mt-1">{errors.Fecha}</p>
          )}
        </div>

        {/* Hora Inicio */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Hora Inicio <span className="text-red-500">*</span>
          </h3>
          <input
            type="time"
            name="Hora_Inicio"
            value={formData.Hora_Inicio}
            onChange={handleChange}
            disabled={!editable}
            className={`w-full p-2 border ${errors.Hora_Inicio ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Hora_Inicio && (
            <p className="text-red-500 text-sm mt-1">{errors.Hora_Inicio}</p>
          )}
        </div>

        {/* Hora Fin */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Hora Fin <span className="text-red-500">*</span>
          </h3>
          <input
            type="time"
            name="Hora_Fin"
            value={formData.Hora_Fin}
            onChange={handleChange}
            disabled={!editable}
            className={`w-full p-2 border ${errors.Hora_Fin ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Hora_Fin && (
            <p className="text-red-500 text-sm mt-1">{errors.Hora_Fin}</p>
          )}
        </div>

        {/* Motivo */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2 md:col-span-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Motivo <span className="text-red-500">*</span>
          </h3>
          <textarea
            name="Motivo"
            value={formData.Motivo}
            onChange={handleChange}
            maxLength={100}
            rows={4}
            disabled={!editable}
            className={`w-full p-2 border ${errors.Motivo ? "border-red-500" : "border-gray-300"} rounded`}
            placeholder="Describa el motivo de la novedad..."
            required
          />
          <div className="flex justify-between items-center mt-1">
            {errors.Motivo && (
              <p className="text-red-500 text-sm">{errors.Motivo}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {formData.Motivo.length}/100 caracteres
            </p>
          </div>
        </div>

        <div className="md:col-span-2 flex gap-2 ml-7">
          <Button
            type="submit"
            className={`green ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isFormValid()}
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

export default EditarNovedadHorario;