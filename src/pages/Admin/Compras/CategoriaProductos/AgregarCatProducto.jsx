import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { catProductoService } from "../../../../service/categoriaProducto.service";


const AgregarCatProducto = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Nombre: "",
        Descripcion: "",
        Es_Ropa: false,
        Estado: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await catProductoService.crearCategoria(formData);
            Swal.fire({
                title: "¡Éxito!",
                text: "La Categoria ha sido guardada correctamente.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
                background: "#000",
                color: "#fff",
            }).then(() => {
                navigate("/admin/categoriaproducto");
            });
            navigate("/admin/categoriaproducto");
        } catch (error) {
            console.error("Error al agregar la categoria de producto:", error);
            alert("Ocurrió un error al agregar la categoria de producto.");
        }
    };

    const handleCancel = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Si cancelas, perderás los datos ingresados.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "No, continuar",
            background: "#000",
            color: "#fff",
        }).then((result) => {
            if (result.isConfirmed) {
                navigate("/admin/categoriaproducto");
            }
        });
    };

    return (
        <>
                <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
                    Agregar Categoria de Producto
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                            <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                                <h3 className="text-2xl text-black font-bold mb-2 block">
                                    Nombre <span className="text-red-500">*</span>
                                </h3>
                                <input
                                    type="text"
                                    name="Nombre"
                                    value={formData.Nombre}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 p-2 rounded"
                                />
                            </div>
                            <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                                <h3 className="text-2xl text-black font-bold mb-2">
                                    Descripción
                                </h3>
                                <input
                                    type="text"
                                    name="Descripcion"
                                    value={formData.Descripcion}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="w-full border border-gray-300 p-2 rounded"
                                />
                            </div>
                            <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2 flex items-center">
                                <h3 className="text-2xl text-black font-bold mb-2">
                                    Es Ropa?
                                </h3>
                                <input
                                    type="checkbox"
                                    name="Es_Ropa"
                                    checked={formData.Es_Ropa}
                                    onChange={handleChange}
                                    className="border border-gray-300 p-2 rounded"
                                    id="esRopa"
                                />
                            </div>
                        
                    <div className="md:col-span-2 flex gap-2 ml-7">
                        <Button type="submit" className="green">
                            Guardar
                        </Button>

                        <Button className="red" onClick={handleCancel}>
                            Cancelar
                        </Button>
                    </div>
                </form>
        </>
    );
};

export default AgregarCatProducto;
