import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { publicAgendamientoService } from "@/service/publicAgendamiento.service";
import { publicEmpleadoService } from "@/service/publicEmpleado.service";
import { showAlert } from "@/components/AlertProvider";

const AgendarModal = ({ cliente, onClose }) => {
  const [barberos, setBarberos] = useState([]);
  const [serviciosEmpleado, setServiciosEmpleado] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    Id_Cliente: cliente?.Id_Cliente || cliente?.id || cliente?.user_id || null,
    Id_Empleados: "",
    Fecha: "",
    Hora_Inicio: "",
    serviciosAgendados: [],
  });

  // Debug: Log cliente data
  useEffect(() => {
    console.log("🔍 Cliente recibido en AgendarModal:", cliente);
    console.log("🔍 Id_Cliente extraído:", cliente?.Id_Cliente || cliente?.id || cliente?.user_id);
    
    // Actualizar formData cuando el cliente cambie
    if (cliente) {
      const clienteId = cliente?.Id_Cliente || cliente?.id || cliente?.user_id;
      setFormData(prev => ({
        ...prev,
        Id_Cliente: clienteId
      }));
    }
  }, [cliente]);

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
            { Id_Servicios: Number(value) },
          ];
        } else {
          // Remover si está
          nuevosServicios = prev.serviciosAgendados.filter(
            (s) => s.Id_Servicios !== Number(value)
          );
        }

        // Validación del campo
        validateField("serviciosAgendados", nuevosServicios);

        return { ...prev, serviciosAgendados: nuevosServicios };
      });
    } else {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        // Asegurar que Id_Cliente siempre esté presente
        if (!updated.Id_Cliente) {
          updated.Id_Cliente = cliente?.Id_Cliente || cliente?.id || cliente?.user_id;
        }
        validateField(name, value);
        return updated;
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Asegurar que Id_Cliente esté presente
    const clienteId = formData.Id_Cliente || cliente?.Id_Cliente || cliente?.id || cliente?.user_id;
    const dataToSend = {
      ...formData,
      Id_Cliente: clienteId
    };
    
    console.log("🔍 Cliente completo:", cliente);
    console.log("🔍 Id_Cliente extraído:", clienteId);
    console.log("🔍 Datos finales antes de enviar:", dataToSend);
    
    Object.entries(dataToSend).forEach(([k, v]) => validateField(k, v));
    if (Object.keys(errors).length > 0) return;

    try {
      await publicAgendamientoService.crearAgendamiento(dataToSend);
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
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm pt-24 sm:pt-28 md:pt-32">
      <div className="bg-gradient-to-b from-gray-900 to-black pt-6 pb-4 px-4 sm:pt-8 sm:pb-6 sm:px-6 md:pt-10 md:pb-8 md:px-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-yellow-500/30 w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-4 mt-8 sm:mt-12 md:mt-16 animate-fade-in relative overflow-hidden text-white max-h-[calc(100vh-10rem)] overflow-y-auto backdrop-blur-sm" style={{
        background: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.3)'
      }}>
        {/* Header reorganizado */}
        <div className="relative mb-6 sm:mb-8 md:mb-10">
          {/* Barra dorada superior */}
          <div className="absolute -top-6 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 rounded-t-2xl sm:rounded-t-3xl"></div>
          
          {/* Contenido del header */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full mb-3 sm:mb-4 shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-1 sm:mb-2">
              Agendar Cita
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm">
              Completa los datos para reservar tu cita
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 text-white">
          {/* Barbero */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-yellow-400">
              <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Barbero *
            </label>
            <div className="relative">
              <select
                name="Id_Empleados"
                value={formData.Id_Empleados}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-yellow-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 bg-gray-800/50 text-white appearance-none cursor-pointer hover:border-yellow-400/50"
              >
                <option value="" className="text-white bg-gray-800">Seleccione un barbero</option>
                {barberos.map((b) => (
                  <option key={b.Id_Empleados} value={b.Id_Empleados} className="text-white bg-gray-800">
                    {b.Nombre}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.Id_Empleados && (
              <p className="text-red-400 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.Id_Empleados}
              </p>
            )}
          </div>

          {/* Fecha y Hora en una fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Fecha */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-yellow-400">
                <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha *
              </label>
              <input
                type="date"
                name="Fecha"
                value={formData.Fecha}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-yellow-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 hover:border-yellow-400/50 bg-gray-800/50 text-white"
              />
              {errors.Fecha && (
                <p className="text-red-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.Fecha}
                </p>
              )}
            </div>

            {/* Hora inicio */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-yellow-400">
                <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hora inicio *
              </label>
              <input
                type="time"
                name="Hora_Inicio"
                value={formData.Hora_Inicio}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-yellow-500/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 hover:border-yellow-400/50 bg-gray-800/50 text-white"
              />
              {errors.Hora_Inicio && (
                <p className="text-red-400 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.Hora_Inicio}
                </p>
              )}
            </div>
          </div>

          {/* Servicios dinámicos */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-yellow-400">
              <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Servicios *
            </label>
            <div className="border border-yellow-500/30 rounded-xl bg-gray-800/30 p-3 sm:p-4 max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
              {!formData.Id_Empleados ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-300 text-sm">
                    Seleccione un barbero para ver sus servicios
                  </p>
                </div>
              ) : serviciosEmpleado.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-orange-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-orange-600 text-sm font-medium mb-1">
                    Este barbero no tiene servicios disponibles
                  </p>
                  <p className="text-gray-300 text-xs">
                    Contacte al administrador para asignar servicios
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {serviciosEmpleado.map((s, index) => (
                    <label
                      key={s.Id_Servicio || `servicio-${index}`}
                      className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg border border-yellow-500/20 hover:border-yellow-400/50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="serviciosAgendados"
                          value={s.Id_Servicio}
                          checked={formData.serviciosAgendados.some(
                            (srv) => srv.Id_Servicios === s.Id_Servicio
                          )}
                          onChange={handleChange}
                          className="w-5 h-5 text-yellow-500 bg-gray-600 border-gray-500 rounded focus:ring-yellow-400 focus:ring-2 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium group-hover:text-yellow-300">
                            {s.Nombre}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-600 font-bold text-lg">
                              ${s.Precio}
                            </span>
                            <span className="text-gray-300 text-sm bg-gray-600/50 px-2 py-1 rounded-full">
                              {s.Duracion} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.serviciosAgendados && (
              <p className="text-red-400 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.serviciosAgendados}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 font-semibold shadow-sm hover:bg-gray-200 hover:shadow-md transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold shadow-lg hover:from-yellow-500 hover:to-amber-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AgendarModal.propTypes = {
  cliente: PropTypes.shape({
    Id_Cliente: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    user_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AgendarModal;
