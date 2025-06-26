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
    const [imagenes, setImagenes] = useState([]);
    const maxImagenes = 5;

    const [tallasDisponibles, setTallasDisponibles] = useState([]);
    const [tallasSeleccionadas, setTallasSeleccionadas] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);


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

            case "imagenes":
                if (imagenes.length === 0) {
                    newErrors[name] = "Debes subir al menos una imagen";
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
        const categoriaId = e.target.value;
        const categoria = categorias.find(cat => cat.Id_Categoria_Producto.toString() === categoriaId);

        setFormData((prev) => ({
            ...prev,
            Id_Categoria_Producto: categoriaId,
            ...(categoriaId === "3"
                ? { Id_Insumos: prev.Id_Insumos }
                : { Id_Insumos: "" }),
        }));

        setCategoriaSeleccionada(categoria || null);
        setTallasDisponibles(categoria?.Tallas || []);
        setTallasSeleccionadas([]);

        validateField("Id_Categoria_Producto", categoriaId);
    };

    const toggleTalla = (idTalla) => {
        setTallasSeleccionadas((prev) =>
            prev.includes(idTalla)
                ? prev.filter((id) => id !== idTalla)
                : [...prev, idTalla]
        );
    };



    useEffect(() => {
        setErrors((prev) => {
            const updated = { ...prev };
            if (imagenes.length === 0) {
                updated.imagenes = "Debes subir al menos una imagen";
            } else {
                delete updated.imagenes;
            }
            return updated;
        });
    }, [imagenes]);


    /* ─────────────────────────────────── */

    /* ───── Manejadores de imágenes ───── */

    const handleImageChange = (e) => {
        if (!e.target.files) return;
        const selected = Array.from(e.target.files);
        if (imagenes.length + selected.length > maxImagenes) {
            setErrors((prev) => ({
                ...prev,
                imagenes: `Solo puedes subir un máximo de ${maxImagenes} imágenes.`,
            }));
            return;
        }
        setImagenes((prev) => [...prev, ...selected]);
        setErrors((prev) => {
            const newErr = { ...prev };
            delete newErr.imagenes;
            return newErr;
        });
        e.target.value = "";
    };
    const removeImage = (idx) => {
        setImagenes((prev) => prev.filter((_, i) => i !== idx));
    };
	
	/* ─────────── Cargar Datos ────────── */

    /* ─────────────────────────────────── */

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await catProductoService.obtenerCategorias();
                setCategorias(response.data);
                console.log(response)
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

        validateField("imagenes", imagenes);
        if (Object.keys(errors).length > 0) {
            showAlert("Por favor Corregir los errores en el formulario", {
                type: "error",
                title: "Error",
                duration: 2000,
            });
            return;
        }

        try {
            const form = new FormData();

            for (const key in formData) {
                if (key === "Id_Insumos" && formData.Id_Categoria_Producto == 3) {
                    form.append("InsumoExtra", JSON.stringify({ Id_Insumos: parseInt(formData.Id_Insumos) }));
                } else {
                    form.append(key, formData[key]);
                }
            }

            if (categoriaSeleccionada?.Es_Ropa && tallasSeleccionadas.length > 0) {
                const tallasFormateadas = tallasSeleccionadas.map((id) => ({ Id_Tallas: id }));
                form.append("TallasSeleccionadas", JSON.stringify(tallasFormateadas));
            }

            imagenes.forEach((img) => {
                form.append("imagenes", img); 
            });

            await productoService.crearProducto(form);

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

                    {categoriaSeleccionada?.Es_Ropa && (
                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-2">
                            <h3 className="text-2xl text-black font-bold mb-2">
                                Tallas Disponibles <span className="text-red-500">*</span>
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                                {tallasDisponibles.map((talla) => (
                                    <label key={talla.Id_Tallas} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={talla.Id_Tallas}
                                            checked={tallasSeleccionadas.includes(talla.Id_Tallas)}
                                            onChange={() => toggleTalla(talla.Id_Tallas)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-black">{talla.Nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-2">
                            <h3 className="text-2xl text-black font-bold mb-2">
                                Imágenes {errors.imagenes && <span className="text-red-500">*</span>}
                            </h3>
                            <div className="flex flex-wrap justify-start gap-4 mb-4">
                            {imagenes.map((file, idx) => (
                                <div key={idx} className="relative w-[200px] h-[200px] rounded overflow-hidden border shadow-md">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`preview-${idx}`}
                                    className="object-cover w-full h-full"
                                />
                                <div className="absolute top-1 right-1 z-20">
                                    <Button
                                    onClick={() => removeImage(idx)}
                                    className="red"
                                    icon="fa-times"
                                    />
                                </div>
                                </div>
                            ))}
                            </div>
                            {errors.imagenes && <p className="text-red-500 text-sm mb-2">{errors.imagenes}</p>}
                            <div className="relative inline-block">
                                <Button
                                    className="blue"
                                    icon="fa-upload"
                                    disabled={imagenes.length >= maxImagenes}
                                >
                                    <div className="flex items-center gap-2">
                                    Seleccionar Imágenes
                                    </div>
                                </Button>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={imagenes.length >= maxImagenes}
                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

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