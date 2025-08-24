import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import GeneralTable from "@/components/GeneralTable";
import { devolucionService } from "@/service/devolucion.service";
import { clienteService } from "@/service/clientes.service";

const Devoluciones = () => {
  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canEdit = (devolucion) => false;
  const canDelete = (devolucion) => devolucion.Estado === true;

  const formatCOP = (value) => {
    if (!value && value !== 0) return "";
    return value;
  };

  const transformData = useCallback(
    (lista) =>
      lista.map((item) => ({
        ...item,
        Id_Devoluciones: item.Id_Devoluciones,
        Total: item.Total ? formatCOP(item.Total) : "$ 0",
        ClienteNombre: item.Cliente?.Nombre || "Cliente no disponible"
      })),
    []
  );

  // Cargar devoluciones
  const fetchDevoluciones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await devolucionService.listarDevoluciones();
      setDevoluciones(transformData(response));
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error al obtener las devoluciones.";
      showAlert(`Error: ${mensaje}`, {
        title: "Error",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [transformData]);

  useEffect(() => {
    fetchDevoluciones();
  }, [fetchDevoluciones]);

  // Columnas de la tabla
  const columns = [
    { header: "ID", accessor: "Id_Devoluciones" },
    { header: "Cliente", accessor: "ClienteNombre" },
    { 
      header: "Fecha", 
      accessor: "Fecha", 
      format: (value) => value ? new Date(value).toLocaleDateString('es-ES') : 'No definida' 
    },
    { 
      header: "Total", 
      accessor: "Total", 
      cellClassName: "font-medium text-green-400"
    },
    { 
      header: "Estado", 
      accessor: "Estado",
      format: (value) => value ? (
        <span className="text-green-500 font-bold">Activo</span>
      ) : (
        <span className="text-red-500 font-bold">Inactivo</span>
      )
    },
  ];

  // Handlers
  const handleToggleEstado = async (id) => {
    try {
      if (!id) {
        showAlert("ID de devolución no válido", { type: "error" });
        return;
      }
      
      const devolucion = devoluciones.find(d => d.Id_Devoluciones === id);
      
      if (!devolucion) {
        showAlert("Devolución no encontrada", { type: "error" });
        return;
      }
      
      const nuevoEstado = !devolucion.Estado;
      
      await devolucionService.cambiarEstadoDevolucion(id, nuevoEstado);
      await fetchDevoluciones();
      
      showAlert(`Devolución ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`, {
        type: "success",
        title: "Éxito",
      });
      
    } catch (error) {
      let mensaje = "No se pudo cambiar el estado de la devolución";
      
      if (error.message.includes("ID de devolución no válido")) {
        mensaje = "El ID de la devolución no es válido";
      } else if (error.message.includes("No se pudo conectar")) {
        mensaje = "No se pudo conectar con el servidor. Verifica tu conexión.";
      }
      
      showAlert(mensaje, {
        type: "error",
        title: "Error",
      });
    }
  };

  const handleAdd = () => {
    navigate("/admin/devoluciones/agregar");
  };

  const handleVerDetalles = async (devolucion) => {
    try {
      const idNumerico = devolucion.Id_Devoluciones;
      const response = await devolucionService.obtenerDevolucionPorId(idNumerico);
      
      const detalles = Array.isArray(response.Productos) ? response.Productos : [];
      const cliente = response.Cliente || {};

      let nombreCliente = cliente.Nombre || "Cliente no disponible";
      if (cliente.Id_Cliente && nombreCliente === "Cliente no disponible") {
        try {
          const clienteData = await clienteService.listarClientePorId(cliente.Id_Cliente);
          nombreCliente = clienteData?.data?.Nombre || nombreCliente;
        } catch (error) {
          // Error silencioso, se mantiene el nombre por defecto
        }
      }

      const safeHtmlValue = (value) => value ?? "N/A";

      const html = `
        <div class="space-y-7 text-gray-100">
          <div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
            <h3 class="text-xl font-bold text-white">Detalles de Devolución</h3>
            <span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
              ID: ${safeHtmlValue(devolucion.Id_Devoluciones)}
            </span>
          </div>

          <div class="grid grid-cols-1 gap-7 md:grid-cols-2">
            <div class="relative">
              <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Fecha</label>
              <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                <div class="font-medium text-white">${safeHtmlValue(devolucion.Fecha)}</div>
              </div>
            </div>

            <div class="relative">
              <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Estado</label>
              <div class="rounded-lg border pt-4 pb-2.5 px-4 ${
                devolucion.Estado
                  ? "bg-[#112d25] border-emerald-500/30"
                  : "bg-[#2c1a1d] border-rose-500/30"
              }">
                <div class="font-medium ${
                  devolucion.Estado ? "text-emerald-300" : "text-rose-300"
                }">${devolucion.Estado ? "Activo" : "Inactivo"}</div>
              </div>
            </div>

            <div class="relative">
              <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Cliente</label>
              <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                <div class="font-medium text-white">${safeHtmlValue(nombreCliente)}</div>
              </div>
            </div>

            <div class="relative">
              <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Total</label>
              <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                <div class="font-medium text-white">${safeHtmlValue(devolucion.Total)}</div>
              </div>
            </div>

            ${devolucion.Motivo ? `
            <div class="relative md:col-span-2">
              <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">Motivo</label>
              <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                <div class="font-medium text-white">${safeHtmlValue(devolucion.Motivo)}</div>
              </div>
            </div>
            ` : ''}

            <div class="relative md:col-span-2">
              <label class="absolute -top-4 left-3 px-1 text-sm font-semibold text-gray-400 bg-[#111827] rounded-md z-30">
                Productos devueltos (${detalles.length})
              </label>
              <div class="rounded-lg border border-gray-600/50 px-4 bg-[#111827] pt-4">
                <div class="max-h-60 overflow-y-auto">
                  ${
                    detalles.length > 0
                      ? `<table class="w-full table-fixed text-left text-sm text-gray-200">
                          <thead class="bg-[#111827] text-gray-300 uppercase tracking-wide shadow">
                            <tr>
                              <th class="py-2 px-3 w-2/5">Producto</th>
                              <th class="py-2 px-3 w-1/5">Cantidad</th>
                              <th class="py-2 px-3 w-1/5">Talla</th>
                              <th class="py-2 px-3 w-1/5">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${detalles
                              .map(
                                (det) => `
                              <tr class="border-b border-gray-700 hover:bg-gray-700/30 transition">
                                <td class="py-2 px-3">${safeHtmlValue(det.Nombre)}</td>
                                <td class="py-2 px-3">${safeHtmlValue(det.Cantidad)}</td>
                                <td class="py-2 px-3">${safeHtmlValue(det.Talla)}</td>
                                <td class="py-2 px-3">${safeHtmlValue(det.Subtotal)}</td>
                              </tr>
                            `
                              )
                              .join("")}
                          </tbody>
                        </table>`
                      : `<p class="italic text-gray-400 text-base">No hay productos en esta devolución</p>`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      await showAlert(html, {
        title: "",
        width: "700px",
        background: "#111827",
        color: "#ffffff",
        padding: "1.5rem",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#4f46e5",
        customClass: {
          popup: "rounded-xl shadow-2xl border border-gray-700/50",
          confirmButton: "px-6 py-2 font-medium rounded-lg",
        },
      });
    } catch (error) {
      showAlert("Error al cargar los detalles. Por favor intente nuevamente.", {
        type: "error",
        title: "Error",
      });
    }
  };

  const handleDelete = async (devolucion) => {
    const result = await showAlert(
      `¿Deseas eliminar la devolución ${devolucion.Id_Devoluciones}?`,
      {
        type: "warning",
        title: "¿Estás seguro?",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }
    );

    if (result.isConfirmed) {
      try {
        const idNumerico = devolucion.Id_Devoluciones;
        await devolucionService.eliminarDevolucion(idNumerico);

        await showAlert("Devolución eliminada correctamente", {
          type: "success",
          title: "Eliminado",
          duration: 2000,
        });

        fetchDevoluciones();
      } catch (error) {
        const mensaje = error.response?.data?.message || "Error al eliminar la devolución";

        showAlert(mensaje, {
          type: "error",
          title: "Error",
          duration: 2500,
        });
      }
    }
  };

  return (
    <GeneralTable
      title="Devoluciones"
      columns={columns}
      data={devoluciones}
      onAdd={handleAdd}
      onView={handleVerDetalles}
      onDelete={handleDelete}
      onToggleEstado={handleToggleEstado}
      idAccessor="Id_Devoluciones"
      stateAccessor="Estado"
      loading={loading}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  );
};

export default Devoluciones;