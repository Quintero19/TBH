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

    /* ───── Validaciones Formulario ───── */

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case "Nombre":
                if (!value.trim()) {
                    newErrors[name] = "El nombre es obligatorio";
                } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{3,25}$/.test(value)) {
                    newErrors[name] = "Solo letras y espacios. Entre 3 y 25 caracteres";
                } else {
                    delete newErrors[name];
                }
                break;

            case "Descripcion":
                if (!value.trim()) {
                    newErrors[name] = "La descripción es obligatoria";
                } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{7,100}$/.test(value)) {
                    newErrors[name] = "Solo letras y espacios. Entre 7 y 100 caracteres";
                } else {
                    delete newErrors[name];
                }
                break;

            case "Precio_Venta":
                if (!value.trim()) {
                    newErrors[name] = "El precio es obligatorio";
                } else if (!/^\d{3,8}$/.test(value)) {
                    newErrors[name] = "Debe contener solo números (3 a 8 dígitos)";
                } else {
                    delete newErrors[name];
                }
                break;
            
            case "Id_Categoria_Producto":
                if (!value.trim()) {
                    newErrors[name] = "Debe seleccionar una categoría de producto";
                } else {
                    delete newErrors[name];
                }
                break;

            case "Id_Insumos":
                if (formData.Id_Categoria_Producto == 3 && !value.trim()) {
                    newErrors[name] = "Debe seleccionar una fragancia";
                } else {
                    delete newErrors[name];
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let updatedValue = type === "checkbox" ? checked : value;

        if (name === "Nombre" || name === "Descripcion") {
            const regex = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]*$/;
            if (!regex.test(updatedValue)) return;
        }

        if (name === "Precio_Venta") {
            updatedValue = updatedValue.replace(/\D/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: updatedValue,
        }));

        validateField(name, updatedValue);
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
                    Id_Insumos: "",
                }),
		}));

        validateField("Id_Categoria_Producto", categoriaProducto);
	};

    /* ─────────────────────────────────── */
	
	/* ─────────── Cargar Datos ────────── */

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

    /* ─────────────────────────────────── */

	/* ──────── Boton de Guardar ───────── */

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

    /* ──────────────────────────────────── */

	/* ───────── Boton de Cancelar ─────────*/

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

    /* ──────────────────────────────────── */

    return (	
        <>
            <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
                Agregar Productos
            </h1>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
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
                                {errors.Id_Insumos && (
                                    <p className="text-red-500 text-sm mt-1">{errors.Id_Insumos}</p>
                                )}
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
                                {errors.Precio_Venta && (
                                    <p className="text-red-500 text-sm mt-1">{errors.Precio_Venta}</p>
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
                                {errors.Nombre && (
                                    <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
                                )}
                        </div>
                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2 flex flex-col items-start min-h-32">
                            <h3 className="text-2xl text-black font-bold mb-2 block">
                                Descripción <span className="text-red-500">*</span>
                            </h3>
                            <textarea
                                name="Descripcion"
                                value={formData.Descripcion}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 p-2 rounded resize-y overflow-y-auto max-h-40"
                        />
                            {errors.Descripcion && (
                                <p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
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