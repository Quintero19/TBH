import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Buttons/Button";
import { showAlert } from "@/components/AlertProvider";
import { clienteService } from "@/service/clientes.service";
import { empleadoService } from "@/service/empleado.service";
import { agendamientosService } from "@/service/agendamiento.service";

const AgregarAgendamiento = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [serviciosEmpleado, setServiciosEmpleado] = useState([]);
  const [errors, setErrors] = useState({});

  // Estado del formulario alineado al backend
  const [formData, setFormData] = useState({
    Id_Cliente: "",
    Id_Empleados: "",
    Fecha: "",
    Hora_Inicio: "",
    serviciosAgendados: [], // [{ Id_Servicios }]
  });

  // Cargar clientes y barberos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [c, b] = await Promise.all([
          clienteService.listarClientes(),
          empleadoService.obtenerEmpleadosActivos(),
        ]);
        setClientes(c?.data || c || []);
        setBarberos(b?.data || b || []);

        console.log(c)
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // Cargar servicios del barbero seleccionado
  useEffect(() => {
    const cargarServiciosEmpleado = async () => {
      if (!formData.Id_Empleados) {
        setServiciosEmpleado([]);
        return;
      }
      try {
        const res = await empleadoService.obtenerServiciosEmpleado(
          formData.Id_Empleados
        );
        setServiciosEmpleado(res.data?.servicios || []);
        console.log(res)
      } catch (error) {
        console.error("Error cargando servicios del empleado:", error);
        setServiciosEmpleado([]);
      }
    };
    cargarServiciosEmpleado();
  }, [formData.Id_Empleados]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "Id_Cliente":
        if (!value) newErrors[name] = "Debes seleccionar un cliente";
        else delete newErrors[name];
        break;
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
    const { name, value, type, checked } = e.target;
    if (name === "serviciosAgendados") {
      let nuevosServicios = [...formData.serviciosAgendados];
      if (checked) {
        nuevosServicios.push({ Id_Servicios: Number(value) });
      } else {
        nuevosServicios = nuevosServicios.filter(
          (s) => s.Id_Servicios !== Number(value)
        );
      }
      setFormData((prev) => ({ ...prev, serviciosAgendados: nuevosServicios }));
      validateField("serviciosAgendados", nuevosServicios);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
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
      }).then(() => navigate("/admin/agendamiento"));
    } catch (error) {
      console.error(error);
      showAlert(error.response?.data?.message || "Error al crear agendamiento", {
        type: "error",
        title: "Error",
        duration: 2000,
      });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold mb-6 text-black">
        Agregar Agendamiento
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Cliente */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Cliente *</h3>
          <select
            name="Id_Cliente"
            value={formData.Id_Cliente}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccione cliente</option>
            {clientes.map((c) => (
              <option key={c.Id_Cliente} value={c.Id_Cliente}>
                {c.Nombre}
              </option>
            ))}
          </select>
          {errors.Id_Cliente && (
            <p className="text-red-500 text-sm">{errors.Id_Cliente}</p>
          )}
        </div>

        {/* Barbero */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Barbero *</h3>
          <select
            name="Id_Empleados"
            value={formData.Id_Empleados}
            onChange={handleChange}
            className="w-full border p-2 rounded"
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
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Fecha *</h3>
          <input
            type="date"
            name="Fecha"
            value={formData.Fecha}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.Fecha && (
            <p className="text-red-500 text-sm">{errors.Fecha}</p>
          )}
        </div>

        {/* Hora inicio */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Hora Inicio *</h3>
          <input
            type="time"
            name="Hora_Inicio"
            value={formData.Hora_Inicio}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.Hora_Inicio && (
            <p className="text-red-500 text-sm">{errors.Hora_Inicio}</p>
          )}
        </div>

        {/* Servicios */}
        <div className="p-6 bg-white border rounded md:col-span-2">
          <h3 className="font-bold mb-2">Servicios *</h3>
          {serviciosEmpleado.length === 0 && (
            <p className="text-gray-500">
              Seleccione un barbero para ver sus servicios
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviciosEmpleado.map((s) => (
              <label
                key={s.Id_Servicio}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  name="serviciosAgendados"
                  value={s.Id_Servicio}
                  checked={formData.serviciosAgendados.some(
                    (srv) => srv.Id_Servicios === s.Id_Servicio
                  )}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
              <span className="text-lg font-medium text-gray-800">
                {s.Nombre} - ${s.Precio} <span className="text-sm text-gray-500">({s.Duracion} min)</span>
              </span>
              </label>
            ))}
          </div>

          {errors.serviciosAgendados && (
            <p className="text-red-500 text-sm mt-2">{errors.serviciosAgendados}</p>
          )}
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" className="green" icon="fa-floppy-o">
            Guardar
          </Button>
          <Button
            type="button"
            className="red"
            onClick={() => navigate("/admin/agendamiento")}
            icon="fa-times"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
};

export default AgregarAgendamiento;
