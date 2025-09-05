import React, { useEffect, useMemo, useState } from "react";
import { agendamientosService } from "@/service/agendamiento.service";
import GeneralTable from "@/components/GeneralTable";
import CalendarioAgendamientos from "@/components/CalendarioAgendamientos";
import { showAlert } from "@/components/AlertProvider";
import { useNavigate } from "react-router-dom";

const AgendamientosPage = () => {
    const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0] // YYYY-MM-DD
  );
  const [agendamientos, setAgendamientos] = useState([]);

  const columnas = [
    { header: "Cliente", accessor: "cliente" },
    { header: "Barbero", accessor: "barbero" },
    { header: "Hora Inicio", accessor: "horaInicio" },
    { header: "Hora Fin", accessor: "horaFin" },
    { header: "Servicios", accessor: "servicios" },
    { header: "Precio Total", accessor: "precio" },
    { header: "Estado", accessor: "estado" },
  ];

  // Normaliza la respuesta del backend al formato que consume la tabla
  const normalizar = (arr = []) =>
    arr.map((a) => ({
      id: a.Id_Agendamientos ?? a.id,
      cliente: a.Cliente?.Nombre ?? a.cliente ?? "",
      barbero: a.Empleado?.Nombre ?? a.barbero ?? "",
      horaInicio: a.Hora_Inicio ?? a.horaInicio ?? "",
      horaFin: a.Hora_Fin ?? a.horaFin ?? "",
      servicios:
        a.servicios ??
        (Array.isArray(a.Servicios)
          ? a.Servicios.map((s) => s.Nombre).join(", ")
          : ""),
      precio: a.Subtotal ?? a.precio ?? 0,
      estado: a.Estado ?? a.estado ?? "Agendado",
      fecha: a.Fecha ?? a.fecha ?? fechaSeleccionada,
    }));

    
	const handleAdd = () => {
		navigate("/admin/agendamientos/agregar");
	};

  const cargarAgendamientos = async (fecha) => {
    try {
      const res = await agendamientosService.obtenerAgendamientoPorFecha(fecha);
      // Soporta tanto service que devuelve el array directo como { status, data }
      const raw = Array.isArray(res) ? res : res?.data ?? [];
      setAgendamientos(normalizar(raw));
    } catch (error) {
      console.error(error);
      showAlert("Error al cargar agendamientos", "error");
      setAgendamientos([]);
    }
  };

  useEffect(() => {
    cargarAgendamientos(fechaSeleccionada);
  }, [fechaSeleccionada]);

  // 🔹 Eventos para el calendario SOLO del día seleccionado
  const eventosCalendario = useMemo(() => {
    return agendamientos
      .filter((a) => (a.fecha ?? fechaSeleccionada) === fechaSeleccionada)
      .map((a) => ({
        id: a.id,
        title: `${a.cliente}${a.servicios ? " - " + a.servicios : ""}`,
        start: `${a.fecha}T${a.horaInicio}`,
        end: `${a.fecha}T${a.horaFin}`,
        color:
          a.estado === "Completada"
            ? "green"
            : a.estado === "Anulada"
            ? "red"
            : "blue",
      }));
  }, [agendamientos, fechaSeleccionada]);

  return (
    <div className="p-6 grid grid-cols-1  gap-6">
      {/* Calendario */}
      <CalendarioAgendamientos
        eventos={eventosCalendario}
        onSelectFecha={setFechaSeleccionada}
      />

      {/* Tabla de agendamientos del día */}
      <GeneralTable
        title="Agendamientos"
        columns={columnas}
        data={agendamientos}
        onAdd={handleAdd}
        onView={(row) => showAlert(`Ver cita de ${row.cliente}`, "info")}
        onEdit={(row) => showAlert(`Editar cita #${row.id}`, "info")}
        onDelete={(row) => showAlert(`Eliminar cita #${row.id}`, "info")}
        stateAccessor="estado"
        idAccessor="id"
      />
    </div>
  );
};

export default AgendamientosPage;
