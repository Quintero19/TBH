import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../../components/GeneralTable";
import { tamanosService } from "../../../../../service/tamanos.service";

const columns = [
    { header: "ID", accessor: "Id_Tamano" },
    { header: "Nombre", accessor: "Nombre" },
    { header: "Cantidad (ml)", accessor: "Cantidad_Maxima" },
    { header: "Precio de Venta", accessor: "Precio_Venta" },
    { header: "Estado", accessor: "Estado" },
];

const Tamanos = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
        const response = await tamanosService.obtenerTamanos();
        setData(response.data);
        } catch (error) {
        console.error("Error al obtener los tamaños:", error.response?.data || error);
        }
    }, []);

    const transformData = useCallback(
        (lista) =>
        lista.map((item) => ({
            ...item,
            Precio_Venta: Number(item.Precio_Venta).toFixed(0),
        })), []
    );

    const filteredData = useMemo(() => {
        const transformed = transformData(data);
        const lowerSearch = searchTerm.toLowerCase();

        const matchEstado = (estado) => {
            if (["1", "activo"].includes(lowerSearch)) return estado === true || estado === 1 || estado === "Activo";
            if (["0", "inactivo"].includes(lowerSearch)) return estado === false || estado === 0 || estado === "Inactivo";
            return false;
        };

        return !searchTerm ? transformed : transformed.filter((item) => {
            return (
                item.Id_Tamano?.toString().includes(lowerSearch) ||
                item.Nombre?.toLowerCase().includes(lowerSearch) ||
                item.Cantidad_Maxima?.toString().includes(lowerSearch) ||
                item.Precio_Venta?.toString().includes(lowerSearch) ||
                matchEstado(item.Estado)
            );
        });
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleToggleEstado = async (id) => {
        try {
        await tamanosService.actualizarEstadoTamano(id);
        await fetchData();
        } catch (error) {
        console.error("Error cambiando estado:", error.response?.data || error);
        Swal.fire("Error", "Error cambiando estado", "error");
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => navigate("/admin/tamanos/agregar");

    const handleVerDetalles = (tamano) => {
        Swal.fire({
        title: `Detalles Tamaño ID: ${tamano.Id_Tamano}`,
        html: 
            `
            <div class="text-left">
                <p><strong>Nombre:</strong> ${tamano.Nombre || "-"}</p>
                <p><strong>Cantidad Máxima:</strong> ${tamano.Cantidad_Maxima || "-"}</p>
                <p><strong>Precio de Venta:</strong> ${tamano.Precio_Venta || "-"}</p>
                <p><strong>Estado:</strong> ${tamano.Estado ? "Activo" : "Inactivo"}</p>
            </div>
            `,
        icon: "info",
        confirmButtonText: "Cerrar",
        padding: "1rem",
        confirmButtonColor: "#3085d6",
        background: "#000",
        color: "#fff",
        });
    };

    const handleEdit = (tamano) => {
        navigate(`/admin/tamanos/editar/${tamano.Id_Tamano}`);
    };

    const handleDelete = async (tamano) => {
        const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `¿Deseas eliminar el tamaño "${tamano.Nombre}"?`,
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
            await tamanosService.eliminarTamano(tamano.Id_Tamano);
            Swal.fire({
            title: "Eliminado",
            text: "Tamaño eliminado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            background: "#000",
            color: "#fff",
            });
            fetchData();
        } catch (error) {
            console.error("Error eliminando tamaño:", error);
            Swal.fire({
            title: "Error",
            text: error.response?.data?.message || "Error al eliminar el tamaño",
            icon: "error",
            timer: 2500,
            showConfirmButton: false,
            background: "#000",
            color: "#fff",
            });
        }
        }
    };

    const handlePageChange = (event, value) => setCurrentPage(value);

    const returnProductos = () => navigate("/admin/productos");

    return (
        <GeneralTable
        title="Tamaños"
        columns={columns}
        data={paginatedData}
        onAdd={handleAdd}
        onView={handleVerDetalles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleEstado={handleToggleEstado}
        idAccessor="Id_Tamano"
        stateAccessor="Estado"
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        return={returnProductos}
        />
    );
};

export default Tamanos;
