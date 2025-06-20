import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { productoService } from "@/service/productos.service";
import { catProductoService } from "@/service/categoriaProducto.service";
import { insumoService } from "@/service/insumo.service";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AgregarProducto = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [categorias, setCategorias] = useState([]);
    const [fragancias, setFragancias] = useState([]);

    const [formData, setFormData] = useState({
        Id_Categoria_Producto: "",
        Nombre: "",
        Precio_Venta: 0,
        Precio_Compra: 0,
        Stock: 0,
        Estado: true,
        Id_Insumos: "",
    });

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await catProductoService.obtenerCategorias();
                setCategorias(response.data);
            } catch (error) {
                console.error("Error al obtener categorías:", error);
            }
        };

        const fetchFragancias = async () => {
            try {
                const response = await insumoService.obtenerInsumosFragancia();
                setFragancias(response.data);
            } catch (error) {
                console.error("Error al obtener categorías:", error);
            }
        };
        fetchCategorias();
        fetchFragancias();
    }, []);

    const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		const updatedValue = type === "checkbox" ? checked : value;
		setFormData((prev) => ({
			...prev,
			[name]: updatedValue,
		}));

	};

    const handleCategoriaChange = (e) => {
		const categoriaProducto = e.target.value;
		setFormData((prev) => ({
			...prev,
			Id_Categoria_Producto: categoriaProducto,
			...(categoriaProducto === "Perfume"
				? {
                    Nombre: "",
                    Descripcion: "",
                    Precio_Venta: 0,
                    Precio_Compra: 0,
                    Stock: 0,
                }: {
                    Nombre: "",
                    Descripcion: "",
                }),
		}));
		setErrors({});
	};

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.keys(errors).length > 0) {
            showAlert("Por favor Corregir los errores en el formulario", {
                type: "error",
                title: "Error",
                duration: 2000,
            });
            return;
        }

        try {
            let dataToSend = { ...formData };

            if (formData.Id_Categoria_Producto == 3) {
                const { Id_Insumos, ...rest } = formData;
                dataToSend = {
                    ...rest,
                    InsumoExtra: {
                        Id_Insumos: parseInt(Id_Insumos),
                    },
                };
            }

            await productoService.crearProducto(dataToSend);

            showAlert("El producto ha sido guardado correctamente.", {
                title: "¡Éxito!",
                type: "success",
                duration: 2000,
            }).then(() => {
                navigate("/admin/productos");
            });
        } catch (error) {
            console.error("Error al agregar el producto:", error);
            showAlert("Error al agregar producto", {
                type: "error",
                title: "Error",
                duration: 2000,
            });
        }
    };

    const handleCancel = () => {
        window
            .showAlert("Si cancelas, perderás los datos ingresados.", {
                title: "¿Estás seguro?",
                type: "warning",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "Continuar Registrando",
            })
            .then((result) => {
                if (result.isConfirmed) {   
                    navigate("/admin/productos");
                }
            });
    };

    return (	
        <>
            <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
                Agregar Productos
            </h1>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Tipo de Proveedor */}
				<div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Categoría de Producto <span className="text-red-500">*</span>
					</h3>
					<select
						name="Id_Categoria_Producto"
						value={formData.Id_Categoria_Producto}
						onChange={handleCategoriaChange}
						className="w-full border border-gray-300 p-2 rounded"
					>
						<option value="">Seleccione una categoría</option>
						{categorias.map((categoria) => (
							<option
								key={categoria.Id_Categoria_Producto}
								value={categoria.Id_Categoria_Producto}
							>
								{categoria.Nombre}
							</option>
						))}
					</select>
						{errors.Id_Categoria_Producto && (
							<p className="text-red-500 text-sm mt-1">{errors.Id_Categoria_Producto}</p>
						)}
				</div>

                {/* Si es Perfume */}
                {formData.Id_Categoria_Producto == 3 && (
                    <>
                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                            <h3 className="text-2xl text-black font-bold mb-2 block">
                                Fragancia
                            </h3>
                            <select
                                type="text"
                                name="Id_Insumos"
                                value={formData.Id_Insumos}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded"
                            >
                                <option value="">Seleccione la fragancia</option>
                                    {fragancias.map((fragancia) => (
                                        <option
                                            key={fragancia.Id_Insumos}
                                            value={fragancia.Id_Insumos}
                                        >
                                            {fragancia.Nombre}
                                        </option>
                                    ))}

                            </select>
                        </div>
                    </>
                )}

                {/* Si es un Producto Normal O Ropa */}
                {formData.Id_Categoria_Producto && formData.Id_Categoria_Producto != 3 && (
                    <>
                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                            <h3 className="text-2xl text-black font-bold mb-2 block">
                                Precio de Venta <span className="text-red-500">*</span>
                            </h3>
                            <input
                                type="text"
                                name="Precio_Venta"
                                value={formData.Precio_Venta}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                            {errors.NIT && (
                                <p className="text-red-500 text-sm mt-1">{errors.NIT}</p>
                            )}
                        </div>
                    </>
                )}

                {formData.Id_Categoria_Producto && (
                    <>
                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                            <h3 className="text-2xl text-black font-bold mb-2 block">
                                Nombre <span className="text-red-500">*</span>
                            </h3>
                            <input
                                type="text"
                                name="Nombre"
                                value={formData.Nombre}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                            {errors.Email && (
                                <p className="text-red-500 text-sm mt-1">{errors.Email}</p>
                            )}
                        </div>
                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                            <h3 className="text-2xl text-black font-bold mb-2 block">
                                Descripción <span className="text-red-500">*</span>
                            </h3>
                            <input
                                type="text"
                                name="Descripcion"
                                value={formData.Descripcion}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded"
                            />
                            {errors.Nombre_Empresa && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.Nombre_Empresa}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="md:col-span-2 flex gap-2 ml-7">
                    <Button
                        type="submit"
                        className="green"
                        disabled={Object.keys(errors).length > 0}
                        icon="fa-floppy-o"
                    >
                        <div className="flex items-center gap-2">Guardar</div>
                    </Button>

                    <Button className="red" onClick={handleCancel} icon="fa-times">
                        <div className="flex items-center gap-2">Cancelar</div>
                    </Button>
                </div>
            </form>
        </>
    );
};

export default AgregarProducto;