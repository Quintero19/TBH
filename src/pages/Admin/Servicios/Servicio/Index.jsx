import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import CarruselImagenes from "@/components/CarruselImagenes";
import { servicioService } from "@/service/serviciosservice";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [serviciosRaw, setServiciosRaw] = useState([]);
  const [mostrarCarrusel, setMostrarCarrusel] = useState(false);
  const [imagenesActuales, setImagenesActuales] = useState([]);
  const canEdit = (servicio) => servicio.Estado === true;
  const canDelete = (servicio) => servicio.Estado === true;
  const navigate = useNavigate();

  const columns = [
    { header: "ID", accessor: "Id_Servicios" },
    { header: "Nombre", accessor: "Nombre" },
    { header: "Precio", accessor: "Precio" },
    {
      header: "Duración",
      accessor: "Duracion",
      format: (value) => `${value} min`,
    },
    { header: "Estado", accessor: "Estado" },
  ];

  /* ──────── Cargar Servicios ───────── */
  const fetchServicios = useCallback(async () => {
    try {
      const response = await servicioService.obtenerServicios();
      setServiciosRaw(response.data);
      setServicios(transformData(response.data));
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error al obtener los servicios.";
      showAlert(`Error: ${mensaje || error}`, {
        title: "Error",
        icon: "error",
      });
    }
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  /* ───── Transformación de Datos ───── */
  const formatCOP = (value) => {
    if (!value && value !== 0) return "";
    return `$ ${Number(value).toLocaleString("es-CO")}`;
  };

  const transformData = useCallback(
    (lista) =>
      lista.map((item) => ({
        ...item,
        Precio: item.Precio != null ? formatCOP(item.Precio) : "-",
        Duracion: item.Duracion != null ? `${item.Duracion}` : "-",
      })),
    []
  );

  /* ────────── Ver Imágenes ─────────── */
  const verImagenes = (servicio) => {
    if (!servicio?.Imagenes?.length) return;
    const urls = servicio.Imagenes.map((img) => img.URL);
    setImagenesActuales(urls);
    setMostrarCarrusel(true);
  };

  /* ───────── Cambiar Estado ────────── */
  const handleToggleEstado = async (id) => {
    try {
      await servicioService.actualizarEstadoServicios(id);
      await fetchServicios();
    } catch (error) {
      console.error("Error cambiando estado:", error.response?.data || error);
      showAlert("Error cambiando estado", {
        title: "Error",
        icon: "error",
      });
    }
  };

  /* ────────── Ir a Agregar ─────────── */
  const handleAdd = () => {
    navigate("/admin/servicios/agregar");
  };

  /* ────────── Ver Detalles ─────────── */
  const handleVerDetalles = async (servicio) => {
    try {
      const html = `				
        <div class="space-y-6 text-gray-100">
          <div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-4">
            <h3 class="text-xl font-bold text-white">Detalles del Servicio</h3>
            <span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
              ID: ${servicio.Id_Servicios ?? "N/A"}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Nombre</label>
              <div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
                ${servicio.Nombre ?? "-"}
              </div>
            </div>

            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Precio</label>
              <div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
                ${servicio.Precio != null ? formatCOP(servicio.Precio) : "-"}
              </div>
            </div>

            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Duración</label>
              <div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white font-medium">
                ${servicio.Duracion ?? "-"} min
              </div>
            </div>

            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Estado</label>
              <div class="rounded-lg px-4 pt-4 pb-2.5 font-medium border ${
                servicio.Estado 
                  ? "bg-[#112d25] border-emerald-500/30 text-emerald-300" 
                  : "bg-[#2c1a1d] border-rose-500/30 text-rose-300"
              }">
                ${servicio.Estado ? "Activo" : "Inactivo"}
              </div>
            </div>
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-[#111827] text-xs text-gray-400 font-semibold px-1 rounded-md z-10">Descripción</label>
            <div class="bg-[#111827] border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 text-white">
              ${servicio.Descripcion ?? "-"}
            </div>
          </div>
        </div>
      `;
      
      await showAlert(html, {
        type: "info",
        showConfirmButton: true,
        swalOptions: {
          confirmButtonText: "Cerrar",
          padding: "1rem",
        },
      });
    } catch (error) {
      console.error("Error al obtener el servicio:", error);
      showAlert(`No se pudieron cargar los detalles del servicio: ${error}`, {
        type: "error",
        title: "Error",
      });
    }
  };

  /* ──────────── Ir a Editar ─────────── */
  const handleEdit = (servicio) => {
    navigate(`/admin/servicios/editar/${servicio.Id_Servicios}`);
  };

  /* ───────────── Eliminar ────────────── */
  const handleDelete = async (servicio) => {
    const result = await window.showAlert(
      `¿Deseas eliminar el servicio <strong>${servicio.Nombre}</strong>?`,
      {
        type: "warning",
        title: "¿Estás seguro?",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      },
    );

    if (result.isConfirmed) {
      try {
        await servicioService.eliminarServicios(servicio.Id_Servicios);

        await window.showAlert("Servicio eliminado correctamente", {
          type: "success",
          title: "Eliminado",
          duration: 2000,
        });

        fetchServicios();
      } catch (error) {
        console.error("Error Eliminando Servicio:", error);
        const mensaje =
          error.response?.data?.message || "Error al eliminar el servicio";

        window.showAlert(mensaje, {
          type: "error",
          title: "Error",
          duration: 2500,
        });
      }
    }
  };

  return (
    <>
      <GeneralTable
        title="Servicios"
        columns={columns}
        data={servicios}
        onAdd={handleAdd}
        onView={(servicioFormateado) => {
          const original = serviciosRaw.find(
            (s) => s.Id_Servicios === servicioFormateado.Id_Servicios
          );
          handleVerDetalles(original);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleEstado={handleToggleEstado}
        idAccessor="Id_Servicios"
        stateAccessor="Estado"
        canEdit={canEdit}
        canDelete={canDelete}
        verImagenes={verImagenes}
      />

      <CarruselImagenes
        imagenes={imagenesActuales}
        visible={mostrarCarrusel}
        onClose={() => setMostrarCarrusel(false)}
      />
    </>
  );
};

export default Servicios;