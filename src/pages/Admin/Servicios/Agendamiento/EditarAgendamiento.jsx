// EditarAgendamiento.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Button from "@/components/Buttons/Button";
import { showAlert } from "@/components/AlertProvider";
import { clienteService } from "@/service/clientes.service";
import { empleadoService } from "@/service/empleado.service";
import { agendamientosService } from "@/service/agendamiento.service";

const EditarAgendamiento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [serviciosEmpleado, setServiciosEmpleado] = useState([]);
  const [agendamientosDelDia, setAgendamientosDelDia] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    Id_Cliente: "",
    Id_Empleados: "",
    Fecha: "",
    Hora_Inicio: "",
    serviciosAgendados: [],
  });

  const getServiceDuration = (serviceId) => {
    const s = serviciosEmpleado.find(
      (se) =>
        Number(se.Id_Servicio) === Number(serviceId) ||
        Number(se.Id_Servicios) === Number(serviceId)
    );
    return Number(s?.Duracion || 0);
  };

  const calcularHoraFin = () => {
    if (!formData.Hora_Inicio || formData.serviciosAgendados.length === 0) {
      return null;
    }

    const totalMinutos = formData.serviciosAgendados.reduce((acc, s) => {
      const serviceId = s.Id_Servicios || s.Id_Servicio || s;
      return acc + getServiceDuration(serviceId);
    }, 0);

    if (!totalMinutos) return null;

    const [h, m] = (formData.Hora_Inicio || "00:00").split(":").map(Number);
    const inicio = new Date(`${formData.Fecha}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
    const fin = new Date(inicio.getTime() + totalMinutos * 60000);
    return fin;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [cRes, bRes, aRes] = await Promise.all([
          clienteService.listarClientes(),
          empleadoService.obtenerEmpleadosActivos(),
          agendamientosService.obtenerAgendamientoPorId(id),
        ]);

        const clientesData = cRes?.data || cRes || [];
        const barberosData = bRes?.data || bRes || [];
        const agendamientoData = aRes?.data || aRes || null;

        setClientes(clientesData);
        setBarberos(barberosData);

        if (agendamientoData) {
          const serviciosNorm = (agendamientoData.serviciosAgendados || []).map((s) => ({
            Id_Servicios: s.Id_Servicios || s.Id_Servicio || s.Id || s
          }));

          setFormData({
            Id_Cliente: agendamientoData.Id_Cliente || "",
            Id_Empleados: agendamientoData.Id_Empleados || "",
            Fecha: agendamientoData.Fecha || "",
            Hora_Inicio: agendamientoData.Hora_Inicio ? agendamientoData.Hora_Inicio.slice(0,5) : "",
            serviciosAgendados: serviciosNorm,
          });
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        showAlert("No se pudo cargar el agendamiento", {
          type: "error",
          title: "Error",
          duration: 2000,
        });
        navigate("/admin/agendamiento");
      }
    };
    cargarDatos();
  }, [id, navigate]);

  useEffect(() => {
    const cargarServiciosEmpleado = async () => {
      if (!formData.Id_Empleados) {
        setServiciosEmpleado([]);
        return;
      }
      try {
        const res = await empleadoService.obtenerServiciosEmpleado(formData.Id_Empleados);
        const servicios = res.data?.servicios || res.data || [];
        setServiciosEmpleado(servicios);
      } catch (error) {
        console.error("Error cargando servicios del empleado:", error);
        setServiciosEmpleado([]);
      }
    };
    cargarServiciosEmpleado();
  }, [formData.Id_Empleados]);

  useEffect(() => {
    const cargarAgendamientos = async () => {
      if (!formData.Fecha || !formData.Id_Empleados) return;
      try {
        const res = await agendamientosService.obtenerAgendamientoPorFecha(formData.Fecha);
        const lista = res?.data || res || [];
        const filtrada = lista.filter(
          (a) => Number(a.Id_Empleados) === Number(formData.Id_Empleados) && Number(a.Id_Agendamientos) !== Number(id)
        );
        setAgendamientosDelDia(filtrada);
      } catch (error) {
        console.error("Error cargando agendamientos del día:", error);
        setAgendamientosDelDia([]);
      }
    };
    cargarAgendamientos();
  }, [formData.Fecha, formData.Id_Empleados, id]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "Hora_Inicio": {
        if (!value) {
          newErrors[name] = "Debes seleccionar la hora de inicio";
        } else {
          const fin = calcularHoraFin();
          if (fin) {
            const limite = new Date(`${formData.Fecha}T21:00:00`);
            if (fin > limite) {
              newErrors[name] = "La hora de fin no puede pasar de las 9:00 PM";
            } else {
              delete newErrors[name];
            }
          } else {
            delete newErrors[name];
          }
        }
        break;
      }
      case "serviciosAgendados": {
        if (!value || value.length === 0) newErrors[name] = "Debes seleccionar al menos un servicio";
        else delete newErrors[name];
        break;
      }
      default: {
        if (!value) newErrors[name] = "Este campo es obligatorio";
        else delete newErrors[name];
      }
    }

    setErrors(newErrors);
  };

  const validarTraslape = () => {
    if (!formData.Hora_Inicio || !formData.Fecha) return true;
    const inicio = new Date(`${formData.Fecha}T${formData.Hora_Inicio}`);
    const fin = calcularHoraFin();
    if (!fin) return true;

    for (let a of agendamientosDelDia) {
      const aInicio = new Date(`${a.Fecha}T${a.Hora_Inicio}`);
      const partes = (a.Hora_Fin || "").split(":").map(Number);
      let aFin;
      if (partes.length >= 2) {
        aFin = new Date(aInicio);
        aFin.setHours(partes[0], partes[1], partes[2] || 0, 0);
      } else {
        continue;
      }

      const seTraslapa = inicio < aFin && fin > aInicio;
      if (seTraslapa) return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "serviciosAgendados") {
      let nuevosServicios = [...formData.serviciosAgendados];
      const valNum = Number(value);
      if (checked) {
        if (!nuevosServicios.some((s) => Number(s.Id_Servicios || s.Id_Servicio || s) === valNum)) {
          nuevosServicios.push({ Id_Servicios: valNum });
        }
      } else {
        nuevosServicios = nuevosServicios.filter((s) => Number(s.Id_Servicios || s.Id_Servicio || s) !== valNum);
      }
      setFormData((prev) => ({ ...prev, serviciosAgendados: nuevosServicios }));
      validateField("serviciosAgendados", nuevosServicios);
    } else {
      const val = type === "number" ? Number(value) : value;
      setFormData((prev) => ({ ...prev, [name]: val }));
      validateField(name, val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Object.entries(formData).forEach(([k, v]) => validateField(k, v));
    if (Object.keys(errors).length > 0) return;

    if (!validarTraslape()) {
      showAlert("El agendamiento se traslapa con otro existente", {
        type: "error",
        title: "Conflicto de horario",
        duration: 2500,
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        serviciosAgendados: (formData.serviciosAgendados || []).map((s) => ({
          Id_Servicios: s.Id_Servicios || s.Id_Servicio || Number(s)
        })),
      };

      await agendamientosService.actualizarAgendamiento(id, payload);

      showAlert("Agendamiento actualizado con éxito", {
        type: "success",
        title: "¡Éxito!",
        duration: 2000,
      }).then(() => navigate("/admin/agendamiento"));
    } catch (error) {
      console.error("Error actualizando agendamiento:", error);
      const message = error?.response?.data?.message || error?.response?.data?.error || "Error al actualizar agendamiento";
      showAlert(message, { type: "error", title: "Error", duration: 2500 });
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
    }).then((res) => {
      if (res.isConfirmed) navigate("/admin/agendamiento");
    });
  };

  return (
    <>
      <h1 className="text-4xl font-bold mb-6 text-black">Editar Agendamiento</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cliente */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Cliente *</h3>
          <select name="Id_Cliente" value={formData.Id_Cliente} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Seleccione cliente</option>
            {clientes.map((c) => (
              <option key={c.Id_Cliente} value={c.Id_Cliente}>
                {c.Nombre}
              </option>
            ))}
          </select>
          {errors.Id_Cliente && <p className="text-red-500 text-sm">{errors.Id_Cliente}</p>}
        </div>

        {/* Barbero */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Barbero *</h3>
          <select name="Id_Empleados" value={formData.Id_Empleados} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Seleccione barbero</option>
            {barberos.map((b) => (
              <option key={b.Id_Empleados} value={b.Id_Empleados}>
                {b.Nombre}
              </option>
            ))}
          </select>
          {errors.Id_Empleados && <p className="text-red-500 text-sm">{errors.Id_Empleados}</p>}
        </div>

        {/* Fecha */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Fecha *</h3>
          <input type="date" name="Fecha" value={formData.Fecha} onChange={handleChange} className="w-full border p-2 rounded" />
          {errors.Fecha && <p className="text-red-500 text-sm">{errors.Fecha}</p>}
        </div>

        {/* Hora inicio */}
        <div className="p-6 bg-white border rounded">
          <h3 className="font-bold mb-2">Hora Inicio *</h3>
          <input type="time" name="Hora_Inicio" value={formData.Hora_Inicio} onChange={handleChange} className="w-full border p-2 rounded" />
          {errors.Hora_Inicio && <p className="text-red-500 text-sm">{errors.Hora_Inicio}</p>}
        </div>

        {/* Servicios */}
        <div className="p-6 bg-white border rounded md:col-span-2">
          <h3 className="font-bold mb-2">Servicios *</h3>
          {serviciosEmpleado.length === 0 && <p className="text-gray-500">Seleccione un barbero para ver sus servicios</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviciosEmpleado.map((s) => {
              const serviceId = s.Id_Servicio ?? s.Id_Servicios;
              const checked = formData.serviciosAgendados.some((srv) => Number(srv.Id_Servicios || srv.Id_Servicio || srv) === Number(serviceId));
              return (
                <label key={String(serviceId)} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    name="serviciosAgendados"
                    value={serviceId}
                    checked={checked}
                    onChange={handleChange}
                    className="w-5 h-5 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-lg font-medium text-gray-800">
                    {s.Nombre} - ${s.Precio} <span className="text-sm text-gray-500">({s.Duracion} min)</span>
                  </span>
                </label>
              );
            })}
          </div>

          {errors.serviciosAgendados && <p className="text-red-500 text-sm mt-2">{errors.serviciosAgendados}</p>}
        </div>

        {/* Botones */}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" className="green" icon="fa-floppy-o">Guardar</Button>
          <Button type="button" className="red" onClick={handleCancel} icon="fa-times">
            <div className="flex items-center gap-2">Cancelar</div>
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditarAgendamiento;
