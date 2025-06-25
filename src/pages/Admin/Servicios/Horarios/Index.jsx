import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../components/GeneralTable";
import {horariosService} from "@/service/horarios.service"
const columns = [
  { header: "ID Novedad", accessor: "Id_Novedades_Horarios" },
  { header: "ID Empleado", accessor: "Id_Empleados" },
  { header: "Fecha", accessor: "Fecha" },
  { header: "Hora Inicio", accessor: "Hora_Inicio" },
  { header: "Hora Fin", accessor: "Hora_Fin" },
  { header: "Motivo", accessor: "Motivo" },
];

const canEdit = (horario) => true; 
const canDelete = (horario) => true; 

const transformData = (data) => {
  return data.map((item) => {
    return {
      ...item,
      Fecha: new Date(item.Fecha).toLocaleDateString(), 
      Hora_Inicio: item.Hora_Inicio?.substring(1, 5) || "-",
      Hora_Fin: item.Hora_Fin?.substring(1, 5) || "-", 
    };
  });
};

const HorariosNovedades = () => {
  const [horarios, setHorarios] = useState([]);
  const navigate = useNavigate();

  const fetchHorarios = useCallback(async () => {
    try {
      const response = await horariosService.obtenerNovedadesHorarios();
      setHorarios(transformData(response.data));
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error al obtener las novedades de horarios.";
      Swal.fire({
        title: "Error",
        text: `Error: ${mensaje || error}`,
        icon: "error",
        background: "#000",
        color: "#fff",
      });
    }
  }, []);

  const handleAdd = () => {
    navigate("/admin/horarios-novedades/agregar");
  };

  const handleVerDetalles = async (horario) => {
    try {
      Swal.fire({
        title: `Detalles Novedad ID: ${horario.Id_Novedades_Horarios}`,
        html: `
          <div class="text-left">
            <p><strong>ID Empleado:</strong> ${horario.Id_Empleados || "-"}</p>
            <p><strong>Fecha:</strong> ${new Date(horario.Fecha).toLocaleDateString() || "-"}</p>
            <p><strong>Hora Inicio:</strong> ${horario.Hora_Inicio?.substring(0, 5) || "-"}</p>
            <p><strong>Hora Fin:</strong> ${horario.Hora_Fin?.substring(0, 5) || "-"}</p>
            <p><strong>Motivo:</strong> ${horario.Motivo || "-"}</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Cerrar",
        padding: "1rem",
        confirmButtonColor: "#3085d6",
        background: "#000",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error al obtener los detalles:", error);
      Swal.fire(
        "Error",
        "No se pudieron cargar los detalles de la novedad",
        "error"
      );
    }
  };

  const handleEdit = (horario) => {
    navigate(`/admin/horarios-novedades/editar/${horario.Id_Novedades_Horarios}`);
  };

  const handleDelete = async (horario) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar la novedad del empleado ${horario.Id_Empleados}?`,
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
        await horariosService.eliminarNovedadHorario(horario.Id_Novedades_Horarios);

        await Swal.fire({
          title: "Eliminado",
          text: "Novedad eliminada correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#000",
          color: "#fff",
        });

        fetchHorarios();
      } catch (error) {
        console.error("Error eliminando novedad:", error);
        const mensaje =
          error.response?.data?.message || "Error al eliminar la novedad";

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

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  return (
    <>
      <GeneralTable
        title="Novedades de Horarios"
        columns={columns}
        data={horarios}
        onAdd={handleAdd}
        onView={handleVerDetalles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        idAccessor="Id_Novedades_Horarios"
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </>
  );
};

export default HorariosNovedades;