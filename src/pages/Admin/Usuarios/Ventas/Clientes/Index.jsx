import { React, useCallback, useEffect, useMemo, useState } from "react";
import GeneralTable from "@/components/GeneralTable";
import { showAlert } from "@/components/AlertProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { clienteService } from "@/service/clientes.service";

export default function Clientes() {
    const navigate = useNavigate();
    const location = useLocation();
    const title = "Clientes";

    const columns = [
        { header: "Tipo Doc.", accessor: "Tipo_Documento" },
        { header: "Documento", accessor: "Documento" },
        { header: "Nombre", accessor: "Nombre" },
        { header: "Celular", accessor: "Celular" },
        {
            header: "Estado",
            accessor: "Estado",
            render: (data) => (
                <span className={data.Estado ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {data.Estado ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
    ];

    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const canEdit = (cliente) => cliente.Estado === true;
    const canDelete = (cliente) => cliente.Estado === true;

    const obtenerClientes = useCallback(async () => {
        try {
            const response = await clienteService.listarClientes();
            const normalizado = response.data.map((cliente) => ({
                Id_Cliente: cliente.Id_Cliente,
                Tipo_Documento: cliente.Tipo_Documento,
                Documento: cliente.Documento,
                Nombre: cliente.Nombre,
                Correo: cliente.Correo,
                Celular: cliente.Celular,
                Direccion: cliente.Direccion,
                F_Nacimiento: cliente.F_Nacimiento,
                Estado: cliente.Estado,
            }));
            setClientes(normalizado);
        } catch (error) {
                    const mensaje =error.response?.data?.message || "Error al obtener los usuarios.";
                        showAlert(`Error: ${mensaje || error}`, {
                                duration: 2500,
                                title: "Error",
                                icon: "error",
                                didClose: () => {navigate(-1)},
                            })
                        }
    }, []);

    useEffect(() => {
        obtenerClientes();
    }, [obtenerClientes, location]);

    const filteredData = useMemo(() => {
        if (!searchTerm) return clientes;

        const lowerSearch = searchTerm.toLowerCase();

        return clientes.filter((cliente) => {
            const tipodocMatch = cliente.Tipo_Documento?.toString().toLowerCase().includes(lowerSearch);
            const docMatch = cliente.Documento?.toString().toLowerCase().includes(lowerSearch);
            const celularMatch = cliente.Celular?.toLowerCase().includes(lowerSearch);
            const nombreMatch = cliente.Nombre?.toLowerCase().includes(lowerSearch);

            let estadoMatch = false;
            if (lowerSearch === "activo") {
                estadoMatch = cliente.Estado === true;
            } else if (lowerSearch === "inactivo") {
                estadoMatch = cliente.Estado === false;
            }

            return tipodocMatch || docMatch || celularMatch || nombreMatch || estadoMatch;
        });
    }, [clientes, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleToggleEstado = async (id) => {
        try {
            await clienteService.actualizarEstadoCliente(id);
            await obtenerClientes();
        } catch (error) {
            console.error("Error cambiando estado del cliente:", error.response?.data || error);
            showAlert("Error cambiando estado del cliente.", {
                type: "error",
                title: "Error",
                duration: 2500,
            });
        }
    };

    const handleDelete = async (cliente) => {
        const result = await showAlert(`¿Deseas eliminar PERMANENTEMENTE al cliente con documento "${cliente.Documento}"?`, {
            type: "warning",
            title: "Confirmar eliminación",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await clienteService.eliminarCliente(cliente.Id_Cliente);
                await showAlert("Cliente eliminado correctamente", {
                    type: "success",
                    title: "Éxito",
                    duration: 2000,
                });
                await obtenerClientes();
            } catch (error) {
                const mensaje =
                    error?.response?.data?.message ||
                    "No se pudo eliminar el cliente. Asegúrate de que no haya dependencias que impidan la eliminación.";
                await showAlert(mensaje, {
                    type: "error",
                    title: "Error",
                    showConfirmButton: true,
                    confirmButtonText: "Cerrar",
                });
            }
        }
    };

    const handleVerDetalles = async (cliente) => {
        try {
            let fechaNacimientoFormateada = "-";
            if (cliente.F_Nacimiento) {
                const [year, month, day] = cliente.F_Nacimiento.split('-').map(Number);
                const fecha = new Date(year, month - 1, day);
                
                if (!isNaN(fecha.getTime())) {
                    fechaNacimientoFormateada = fecha.toLocaleDateString();
                } else {
                    fechaNacimientoFormateada = "Fecha inválida";
                }
            }
            
            const html = `
            <div class="space-y-7 text-gray-100">
                <!-- Encabezado -->
                <div class="flex items-center justify-between border-b border-gray-600/50 pb-3 mb-5">
                    <h3 class="text-xl font-bold text-white">Detalles de Cliente</h3>
                    <span class="rounded-md bg-gray-700 px-2 py-1 text-sm font-mono text-gray-300">
                        ID: ${cliente.Id_Cliente ?? "N/A"}
                    </span>
                </div>

                <!-- Campos -->
                <div class="grid grid-cols-1 gap-7 md:grid-cols-2">
                    <!-- Tipo Documento -->
                    <div class="relative">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Tipo Documento
                        </label>
                        <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                            <div class="font-medium text-white">${cliente.Tipo_Documento ?? "-"}</div>
                        </div>
                    </div>
                    <!-- Documento -->
                    <div class="relative">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Documento
                        </label>
                        <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                            <div class="font-medium text-white">${cliente.Documento ?? "-"}</div>
                        </div>
                    </div>
                    <!-- Nombre -->
                    <div class="relative md:col-span-2">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Nombre
                        </label>
                        <div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
                            <div class="text-gray-200">${cliente.Nombre || "-"}</div>
                        </div>
                    </div>
                    <!-- Correo -->
                    <div class="relative md:col-span-2">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Correo
                        </label>
                        <div class="rounded-lg border border-gray-600/50 pt-4 pb-2.5 px-4 bg-[#111827] min-h-12">
                            <div class="text-gray-200 ${!cliente.Correo ? 'italic text-gray-400' : ''}">
                                ${cliente.Correo || "No hay correo disponible"}
                            </div>
                        </div>
                    </div>
                    <!-- Celular -->
                    <div class="relative">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Celular
                        </label>
                        <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                            <div class="font-medium text-white">${cliente.Celular ?? "-"}</div>
                        </div>
                    </div>
                    <!-- Dirección -->
                    <div class="relative">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Dirección
                        </label>
                        <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                            <div class="font-medium text-white">${cliente.Direccion ?? "-"}</div>
                        </div>
                    </div>
                    <!-- Fecha Nacimiento -->
                    <div class="relative">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            F. Nacimiento
                        </label>
                        <div class="border border-gray-600/50 rounded-lg px-4 pt-4 pb-2.5 bg-[#111827]">
                            <div class="font-medium text-white">${fechaNacimientoFormateada}</div>
                        </div>
                    </div>
                    <!-- Estado -->
                    <div class="relative">
                        <label class="absolute -top-2.5 left-3 px-1 text-xs font-semibold text-gray-400 z-10 rounded-md bg-[#111827]">
                            Estado
                        </label>
                        <div class="rounded-lg border pt-4 pb-2.5 px-4 ${
                        cliente.Estado
                            ? 'bg-[#112d25] border-emerald-500/30'
                            : 'bg-[#2c1a1d] border-rose-500/30'
                        }">
                        <div class="font-medium ${
                        cliente.Estado ? "text-emerald-300" : "text-rose-300"
                        }">
                            ${cliente.Estado ? "Activo" : "Inactivo"}
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

            await showAlert(html, {
                title: '',
                width: '640px',
                background: '#111827',
                color: '#ffffff',
                padding: '1.5rem',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#4f46e5',
                customClass: {
                    popup: 'rounded-xl shadow-2xl border border-gray-700/50',
                    confirmButton: 'px-6 py-2 font-medium rounded-lg mt-4'
                }
            });

        } catch (error) {
            console.error(error);
            await showAlert(`Error: ${error.message || error}`, {
                title: 'Error',
                icon: 'error',
                background: '#1f2937',
                color: '#ffffff',
                width: '500px',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const handleEdit = (cliente) => {
        navigate(`/admin/clientes/editar/${cliente.Id_Cliente}`);
    };

    return (
        <GeneralTable
            title={title}
            columns={columns}
            data={filteredData}
            onAdd={() => navigate("/admin/clientes/agregar")}
            onView={handleVerDetalles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleEstado={handleToggleEstado}
            idAccessor="Id_Cliente"
            stateAccessor="Estado"
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
}
