import React, { useEffect, useMemo, useState } from "react";
import { agendamientosService } from "@/service/agendamiento.service";
import GeneralTable from "@/components/GeneralTable";
import CalendarioAgendamientos from "@/components/CalendarioAgendamientos";
import { showAlert } from "@/components/AlertProvider";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

  // 🔹 Función ver
  const handleVer = (row) => {
    const html = `
      <div class="space-y-4 text-gray-100">
        <h3 class="text-lg font-bold text-white">Detalles de Cita</h3>
        <p><b>Cliente:</b> ${row.cliente}</p>
        <p><b>Barbero:</b> ${row.barbero}</p>
        <p><b>Servicios:</b> ${row.servicios || "-"}</p>
        <p><b>Hora:</b> ${row.horaInicio} - ${row.horaFin}</p>
        <p><b>Precio:</b> $${row.precio}</p>
        <p><b>Estado:</b> ${row.estado}</p>
      </div>
    `;

    Swal.fire({
      title: "Detalles del Agendamiento",
      html,
      icon: "info",
      showConfirmButton: false,
      background: "#111827",
      color: "#fff",
      width: "500px",
      timer: 3000,
    });
  };

  // 🔹 Función editar
  const handleEdit = (row) => {
    navigate(`/admin/agendamientos/editar/${row.id}`);
  };

  // 🔹 Función eliminar
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar la cita de "${row.cliente}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#000",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await agendamientosService.eliminarAgendamiento(row.id);

        await Swal.fire({
          title: "Eliminado",
          text: "Agendamiento eliminado correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#000",
          color: "#fff",
        });

        cargarAgendamientos(fechaSeleccionada);
      } catch (error) {
        console.error("Error eliminando agendamiento:", error);
        const mensaje =
          error.response?.data?.message || "Error al eliminar el agendamiento";

        Swal.fire({
          title: "Error",
          text: mensaje,
          icon: "error",
          timer: 2500,
          showConfirmButton: false,
          background: "#000",
          color: "#fff",
        });
      }
    }
  };

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
    <div className="p-6 grid grid-cols-1 gap-6">
      {/* Calendario */}
      <CalendarioAgendamientos
        eventos={eventosCalendario}
        onSelectFecha={setFechaSeleccionada}
      />

      {/* Tabla */}
      <GeneralTable
        title="Agendamientos"
        columns={columnas}
        data={agendamientos}
        onAdd={handleAdd}
        onView={handleVer}
        onEdit={handleEdit}
        onDelete={handleDelete}
        stateAccessor="estado"
        idAccessor="id"
      />
    </div>
  );
};

export default AgendamientosPage;
