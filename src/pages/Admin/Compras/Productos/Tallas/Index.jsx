import { React, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import GeneralTable from "../../../../../components/GeneralTable";
import { tallasService } from "../../../../../service/tallas.service";
import { catProductoService } from "../../../../../service/categoriaProducto.service";

const columns = [
    { header: "ID", accessor: "Id_Tallas" },
    { header: "Categoria de Producto", accessor: "NombreCategoria" },
    { header: "Nombre", accessor: "Nombre" },
    { header: "Estado", accessor: "Estado" },
];

const Tallas = () => {
    const [categorias, setCategorias] = useState([]);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const fetchCategorias = useCallback(async () => {
    try {
        const response = await catProductoService.obtenerCategorias();
        setCategorias(response.data);
    } catch (error) {
        console.error("Error al obtener categorías:", error.response?.data || error);
    }
    }, []);


    const fetchData = useCallback(async () => {
        try {
            const response = await tallasService.obtenerTallas();
            console.log(response);
            setData(response.data);
        } catch (error) {
            console.error("Error al obtener las tallas:", error.response?.data || error);
        }
    }, []);

    const transformData = useCallback(
        (lista) =>
            lista.map((item) => {
                const categoria = categorias.find(c => c.Id_Categoria_Producto === item.Id_Categoria_Producto);
                return {
                    ...item,
                    NombreCategoria: categoria?.Nombre || "Desconocido"
                };
            }), [categorias]
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
                item.Id_Tallas?.toString().includes(lowerSearch) ||
                item.NombreCategoria?.toLowerCase().includes(lowerSearch) ||
                item.Nombre?.toLowerCase().includes(lowerSearch) ||
                matchEstado(item.Estado)
            );
        });
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleToggleEstado = async (id) => {
        try {
            await tallasService.actualizarEstadoTalla(id);
            await fetchData();
        } catch (error) {
            console.error("Error cambiando estado:", error.response?.data || error);
            alert("Error cambiando estado");
        }
    };

    useEffect(() => {
        fetchCategorias();
        fetchData();
    }, [fetchCategorias, fetchData]);

    const handleAdd = () => {
        navigate("/admin/tallas/agregar");
    };

    const handleVerDetalles = async (talla) => {
        try {
            Swal.fire({
                title: `Detalles Talla ID: ${talla.Id_Tallas}`,
                html: 
                    `
                    <div class="text-left">
                        <p><strong>Categoria Producto:</strong> ${talla.NombreCategoria || "-"}</p>
                        <p><strong>Nombre:</strong> ${talla.Nombre || "-"}</p>
                        <p><strong>Estado:</strong> ${talla.Estado ? "Activo" : "Inactivo"}</p>
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
            console.error("Error al obtener la talla:", error);
            Swal.fire(
                "Error",
                "No se pudieron cargar los detalles de la talla",
                "error",
            );
        }
    };

    const handleEdit = (talla) => {
        navigate(`/admin/tallas/editar/${talla.Id_Tallas}`);
    };

    const handleDelete = async (talla) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `¿Deseas Eliminar la Talla "${talla.Nombre}"?`,
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
                await tallasService.eliminarTalla(talla.Id_Tallas);

                await Swal.fire({
                    title: "Eliminada",
                    text: "Talla eliminada correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    background: "#000",
                    color: "#fff",
                });

                fetchData();
            } catch (error) {
                console.error("Error Eliminando Talla:", error);
                const mensaje =
                    error.response?.data?.message || "Error al Eliminar la Talla";

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

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const returnProductos = () => {
        navigate(`/admin/productos`)
    }

    return (
        <GeneralTable
            title="Tallas"
            columns={columns}
            data={paginatedData}
            onAdd={handleAdd}
            onView={handleVerDetalles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleEstado={handleToggleEstado}
            idAccessor="Id_Tallas"
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

export default Tallas;
