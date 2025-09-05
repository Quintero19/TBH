import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Buttons/Button";
import { showAlert } from "@/components/AlertProvider";
import { servicioService } from "@/service/serviciosService";
import { clienteService } from "@/service/clientes.service";
import { empleadoService } from "@/service/empleado.service";
import { agendamientosService } from "@/service/agendamiento.service";

const AgregarAgendamiento = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    clienteId: "",
    barberoId: "",
    fecha: "",
    horaInicio: "",
    serviciosSeleccionados: [],
    precioTotal: 0,
    horaFin: "",
    telefono: "",
    estado: "Pendiente",
  });

  // Cargar clientes, barberos y servicios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [c, b, s] = await Promise.all([
          clienteService.obtenerClientes(),
          empleadoService.obtenerEmpleados(),
          servicioService.obtenerServicios(),
        ]);
        setClientes(c || []);
        setBarberos(b || []);
        setServicios(s || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, []);

  // Calcular precio total y hora fin cuando cambian servicios o la horaInicio
  useEffect(() => {
    if (!formData.serviciosSeleccionados.length) {
      setFormData((prev) => ({ ...prev, precioTotal: 0, horaFin: "" }));
      return;
    }

    const serviciosElegidos = servicios.filter((s) =>
      formData.serviciosSeleccionados.includes(s.id.toString())
    );

    const precioTotal = serviciosElegidos.reduce(
      (acc, s) => acc + parseFloat(s.Precio || 0),
      0
    );

    const duracionTotal = serviciosElegidos.reduce(
      (acc, s) => acc + parseInt(s.Duracion || 0, 10),
      0
    );

    let horaFin = "";
    if (formData.horaInicio) {
      const [h, m] = formData.horaInicio.split(":").map(Number);
      const inicioDate = new Date(`${formData.fecha}T${formData.horaInicio}`);
      inicioDate.setMinutes(inicioDate.getMinutes() + duracionTotal);
      horaFin = inicioDate.toTimeString().slice(0, 5);
    }

    setFormData((prev) => ({
      ...prev,
      precioTotal,
      horaFin,
    }));
  }, [formData.serviciosSeleccionados, formData.horaInicio, formData.fecha]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "clienteId":
        if (!value) newErrors[name] = "Debes seleccionar un cliente";
        else delete newErrors[name];
        break;
      case "barberoId":
        if (!value) newErrors[name] = "Debes seleccionar un barbero";
        else delete newErrors[name];
        break;
      case "fecha":
        if (!value) newErrors[name] = "Debes seleccionar una fecha";
        else delete newErrors[name];
        break;
      case "horaInicio":
        if (!value) newErrors[name] = "Debes seleccionar la hora de inicio";
        else delete newErrors[name];
        break;
      case "telefono":
        if (!/^\d{7,10}$/.test(value)) {
          newErrors[name] = "Número inválido (7 a 10 dígitos)";
        } else delete newErrors[name];
        break;
      case "serviciosSeleccionados":
        if (!value.length) {
          newErrors[name] = "Debes seleccionar al menos un servicio";
        } else delete newErrors[name];
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, options } = e.target;

    if (name === "serviciosSeleccionados") {
      const selected = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setFormData((prev) => ({ ...prev, [name]: selected }));
      validateField(name, selected);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar antes de enviar
    Object.entries(formData).forEach(([k, v]) => validateField(k, v));
    if (Object.keys(errors).length > 0) return;

    try {
      await agendamientosService.crearAgendamiento(formData);

      showAlert("Agendamiento creado con éxito", {
        type: "success",
        title: "¡Éxito!",
        duration: 2000,
      }).then(() => navigate("/admin/agendamientos"));
    } catch (error) {
      console.error(error);
      showAlert("Error al crear agendamiento", {
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
            name="clienteId"
            value={formData.clienteId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccione cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errors.clienteId && (
            <p className="text-red-500 text-sm">{errors.clienteId}</p>
          )}
        </div>

        {/* Barbero */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Barbero *</h3>
          <select
            name="barberoId"
            value={formData.barberoId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccione barbero</option>
            {barberos.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
          {errors.barberoId && (
            <p className="text-red-500 text-sm">{errors.barberoId}</p>
          )}
        </div>

        {/* Fecha */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Fecha *</h3>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.fecha && (
            <p className="text-red-500 text-sm">{errors.fecha}</p>
          )}
        </div>

        {/* Hora inicio */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Hora Inicio *</h3>
          <input
            type="time"
            name="horaInicio"
            value={formData.horaInicio}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.horaInicio && (
            <p className="text-red-500 text-sm">{errors.horaInicio}</p>
          )}
        </div>

        {/* Servicios */}
        <div className="p-6 bg-white border rounded md:col-span-2">
          <h3 className="font-bold mb-2">Servicios *</h3>
          <select
            multiple
            name="serviciosSeleccionados"
            value={formData.serviciosSeleccionados}
            onChange={handleChange}
            className="w-full border p-2 rounded h-40"
          >
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.Nombre} - ${s.Precio}
              </option>
            ))}
          </select>
          {errors.serviciosSeleccionados && (
            <p className="text-red-500 text-sm">{errors.serviciosSeleccionados}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Teléfono *</h3>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.telefono && (
            <p className="text-red-500 text-sm">{errors.telefono}</p>
          )}
        </div>

        {/* Estado */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Estado</h3>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
            <option value="Anulada">Anulada</option>
          </select>
        </div>

        {/* Precio Total */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Precio Total</h3>
          <input
            type="text"
            readOnly
            value={`$${formData.precioTotal}`}
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        {/* Hora Fin */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Hora Fin</h3>
          <input
            type="time"
            readOnly
            value={formData.horaFin}
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" className="green" icon="fa-floppy-o">
            Guardar
          </Button>
          <Button
            type="button"
            className="red"
            onClick={() => navigate("/admin/agendamientos")}
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
