import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { agendamientosService } from "@/service/agendamiento.service";
import { publicEmpleadoService } from "@/service/publicEmpleado.service";
import { showAlert } from "@/components/AlertProvider";

const AgendarModal = ({ cliente, onClose }) => {
  const [barberos, setBarberos] = useState([]);
  const [serviciosEmpleado, setServiciosEmpleado] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    Id_Cliente: cliente.Id_Cliente,
    Id_Empleados: "",
    Fecha: "",
    Hora_Inicio: "",
    serviciosAgendados: [],
  });

  // Debug: Log formData changes
  useEffect(() => {
    console.log("🔍 Debug - formData actualizado:", formData);
  }, [formData]);

  useEffect(() => {
    const cargarBarberos = async () => {
      try {
        const b = await publicEmpleadoService.obtenerEmpleadosActivos();
        setBarberos(b?.data || b || []);
      } catch (err) {
        console.error("Error cargando barberos:", err);
        showAlert("Error al cargar la lista de barberos. Por favor, inténtalo de nuevo.", {
          type: "error",
          title: "Error",
          duration: 3000,
        });
      }
    };
    cargarBarberos();
  }, []);

  useEffect(() => {
    const cargarServiciosEmpleado = async () => {
      if (!formData.Id_Empleados) {
        setServiciosEmpleado([]);
        return;
      }
      try {
        const res = await publicEmpleadoService.obtenerServiciosEmpleado(
          formData.Id_Empleados
        );
        const servicios = res.servicios || [];
        setServiciosEmpleado(servicios);
        console.log(servicios)
      } catch (err) {
        console.error("Error cargando servicios del empleado:", err);
        setServiciosEmpleado([]);
        showAlert("Error al cargar los servicios del barbero. Por favor, inténtalo de nuevo.", {
          type: "error",
          title: "Error",
          duration: 3000,
        });
      }
    };
    cargarServiciosEmpleado();
  }, [formData.Id_Empleados]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "Id_Empleados":
        if (!value) newErrors[name] = "Debes seleccionar un barbero";
        else delete newErrors[name];
        break;
      case "Fecha":
        if (!value) newErrors[name] = "Debes seleccionar una fecha";
        else delete newErrors[name];
        break;
      case "Hora_Inicio":
        if (!value) newErrors[name] = "Debes seleccionar la hora de inicio";
        else delete newErrors[name];
        break;
      case "serviciosAgendados":
        if (!value.length)
          newErrors[name] = "Debes seleccionar al menos un servicio";
        else delete newErrors[name];
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    if (name === "serviciosAgendados") {
      setFormData((prev) => {
        let nuevosServicios;
        if (checked) {
          // Agregar si no está
          nuevosServicios = [
            ...prev.serviciosAgendados,
            { Id_Servicio: Number(value) },
          ];
        } else {
          // Remover si está
          nuevosServicios = prev.serviciosAgendados.filter(
            (s) => s.Id_Servicio !== Number(value)
          );
        }

        // Validación del campo
        validateField("serviciosAgendados", nuevosServicios);

        return { ...prev, serviciosAgendados: nuevosServicios };
      });
    } else {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        validateField(name, value);
        return updated;
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    Object.entries(formData).forEach(([k, v]) => validateField(k, v));
    if (Object.keys(errors).length > 0) return;

    try {
      await agendamientosService.crearAgendamiento(formData);
      showAlert("Agendamiento creado con éxito", {
        type: "success",
        title: "¡Éxito!",
        duration: 2000,
      });
      onClose();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.message || "Error al crear agendamiento", {
        type: "error",
        title: "Error",
        duration: 2000,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl border-2 border-yellow-500 w-full max-w-lg animate-fade-in">
        <h2 className="text-3xl font-extrabold text-yellow-600 mb-4 text-center drop-shadow-md">
          ✨ Agendar Cita ✨
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-black">
          {/* Barbero */}
          <div>
            <label className="font-semibold block mb-1">Barbero *</label>
            <select
              name="Id_Empleados"
              value={formData.Id_Empleados}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Seleccione barbero</option>
              {barberos.map((b) => (
                <option key={b.Id_Empleados} value={b.Id_Empleados}>
                  {b.Nombre}
                </option>
              ))}
            </select>
            {errors.Id_Empleados && (
              <p className="text-red-500 text-sm">{errors.Id_Empleados}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="font-semibold block mb-1">Fecha *</label>
            <input
              type="date"
              name="Fecha"
              value={formData.Fecha}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
            />
            {errors.Fecha && (
              <p className="text-red-500 text-sm">{errors.Fecha}</p>
            )}
          </div>

          {/* Hora inicio */}
          <div>
            <label className="font-semibold block mb-1">Hora inicio *</label>
            <input
              type="time"
              name="Hora_Inicio"
              value={formData.Hora_Inicio}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400"
            />
            {errors.Hora_Inicio && (
              <p className="text-red-500 text-sm">{errors.Hora_Inicio}</p>
            )}
          </div>

          {/* Servicios dinámicos */}
          <div>
            <label className="font-semibold block mb-1">Servicios *</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
              {!formData.Id_Empleados ? (
                <p key="no-barbero" className="text-gray-500 text-sm">
                  Seleccione un barbero para ver sus servicios
                </p>
              ) : serviciosEmpleado.length === 0 ? (
                <div key="no-servicios" className="text-center py-4">
                  <p className="text-orange-600 text-sm font-medium">
                    ⚠️ Este barbero no tiene servicios disponibles
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Contacte al administrador para asignar servicios
                  </p>
                </div>
              ) : (
                serviciosEmpleado.map((s, index) => (
                  <label
                    key={s.Id_Servicio || `servicio-${index}`}
                    className="flex items-center space-x-2 hover:bg-yellow-50 p-1 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="serviciosAgendados"
                      value={s.Id_Servicio}
                      checked={formData.serviciosAgendados.some(
                        (srv) => srv.Id_Servicio === s.Id_Servicio
                      )}
                      onChange={handleChange}
                      className="accent-yellow-500 cursor-pointer"
                    />
                    <span className="text-black">
                      {s.Nombre} -{" "}
                      <span className="text-yellow-600 font-semibold">
                        ${s.Precio}
                      </span>{" "}
                      ({s.Duracion} min)
                    </span>
                  </label>
                ))
              )}
            </div>
            {errors.serviciosAgendados && (
              <p className="text-red-500 text-sm">{errors.serviciosAgendados}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-bold shadow-md hover:bg-yellow-600 transition"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300 text-black font-bold shadow-md hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AgendarModal.propTypes = {
  cliente: PropTypes.shape({
    Id_Cliente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AgendarModal;
