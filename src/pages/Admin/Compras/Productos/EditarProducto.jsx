import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { productoService } from "@/service/productos.service";
import { catProductoService } from "@/service/categoriaProducto.service";
import { insumoService } from "@/service/insumo.service";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditarProducto = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [errors, setErrors] = useState({});
    const [categorias, setCategorias] = useState([]);
    const [fragancias, setFragancias] = useState([]);
    const [imagenesNuevas, setImagenesNuevas] = useState([]);
    const [imagenesExistentes, setImagenesExistentes] = useState([]);
    const [imagenesEliminadas, setImagenesEliminadas] = useState([]);
    const maxImagenes = 5;

    const [formData, setFormData] = useState({
        Id_Categoria_Producto: "",
        Nombre: "",
        Descripcion: "",
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
                if (images.length === 0) {
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
        const value = e.target.value;

        setFormData((prev) => ({
            ...prev,
            Id_Categoria_Producto: value === "" ? "" : parseInt(value),
            Precio_Compra: value === "3" ? null : prev.Precio_Compra,
            Precio_Venta: value === "3" ? null : prev.Precio_Venta,
            Id_Insumos: value === "3" ? prev.Id_Insumos : ""
        }));

        validateField("Id_Categoria_Producto", value);
    };

    useEffect(() => {
        const total = imagenesExistentes.length + imagenesNuevas.length;

        setErrors((prev) => {
            const updated = { ...prev };
            if (total === 0) {
                updated.imagenes = "Debes subir al menos una imagen";
            } else {
                delete updated.imagenes;
            }
            return updated;
        });
    }, [imagenesExistentes, imagenesNuevas]);

    /* ─────────────────────────────────── */

    /* ───── Manejadores de imágenes ───── */

    const handleImageChange = (e) => {
        if (!e.target.files) return;
        const seleccionadas = Array.from(e.target.files);
        const total = imagenesExistentes.length + imagenesNuevas.length;

        if (total + seleccionadas.length > maxImagenes) {
            setErrors((prev) => ({
                ...prev,
                imagenes: `Máximo ${maxImagenes} imágenes permitidas.`,
            }));
            return;
        }

        setImagenesNuevas((prev) => [...prev, ...seleccionadas]);

        setErrors((prev) => {
            const err = { ...prev };
            delete err.imagenes;
            return err;
        });

        e.target.value = "";
    };

    const removeNuevaImagen = (idx) => {
        setImagenesNuevas((prev) => prev.filter((_, i) => i !== idx));
    };

    const removeImagenExistente = (id) => {
        setImagenesExistentes((prev) => prev.filter((img) => img.Id_Imagenes !== id));
        setImagenesEliminadas((prev) => [...prev, id]);
    };
	
	/* ─────────────────────────────────── */
	
	/* ─────────── Cargar Datos ────────── */

    const fetchDatos = useCallback(async () => {
        try {
            const [catRes, fragRes, prodRes] = await Promise.all([
                catProductoService.obtenerCategorias(),
                insumoService.obtenerInsumosFragancia(),
                productoService.obtenerProductoPorId(id),
            ]);

            setCategorias(catRes.data);
            setFragancias(fragRes.data);

            const producto = prodRes.data;

            setFormData({
                Id_Categoria_Producto: producto.Id_Categoria_Producto,
                Nombre: producto.Nombre,
                Descripcion: producto.Descripcion || "",
                Precio_Venta: parseFloat(producto.Precio_Venta) || 0,
                Precio_Compra: parseFloat(producto.Precio_Compra) || 0,
                Stock: producto.Stock || 0,
                Estado: producto.Estado ?? true,
                Id_Insumos: producto.InsumoExtra?.Id_Insumos || "",
            });

            setImagenesExistentes(producto.Imagenes || []);
        } catch (error) {
            console.error("Error cargando datos del producto:", error);
        };
    }, [id]);

    useEffect(() => {
        fetchDatos();
    }, [fetchDatos]);

    /* ─────────────────────────────────── */

	/* ──────── Boton de Guardar ───────── */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (imagenesExistentes.length + imagenesNuevas.length === 0) {
            setErrors((prev) => ({
                ...prev,
                imagenes: "Debes subir al menos una imagen",
            }));
            return;
        }

        if (Object.keys(errors).length > 0) {
            showAlert("Corrige los errores del formulario", {
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

            imagenesNuevas.forEach((img) => {
                form.append("imagenes", img);
            });

            if (imagenesEliminadas.length > 0) {
                form.append("ImagenesEliminadas", JSON.stringify(imagenesEliminadas));
            }

            await productoService.actualizarProducto(id, form);

            showAlert("Producto actualizado correctamente.", {
                title: "¡Éxito!",
                type: "success",
                duration: 2000,
            }).then(() => {
                navigate("/admin/productos");
            });
        } catch (error) {
            const mensaje = error.response?.data?.message || "Error al actualizar";
            showAlert(mensaje, {
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
            .showAlert("Si cancelas, perderás los cambios no guardados.", {
                title: "¿Estás seguro?",
                type: "warning",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "Seguir editando",
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
                Editar Productos
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

                <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-1 m-7 mt-2">
                {formData.Id_Categoria_Producto == 3 && (
                    <>
                        <h3 className="text-2xl text-black font-bold mb-2 block">Fragancia</h3>
                        <select
                            name="Id_Insumos"
                            value={formData.Id_Insumos}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        >
                            <option value="">Seleccione la fragancia</option>
                            {fragancias.map((fragancia) => (
                                <option key={fragancia.Id_Insumos} value={fragancia.Id_Insumos}>
                                    {fragancia.Nombre}
                                </option>
                            ))}
                        </select>
                            {errors.Id_Insumos && (
                                <p className="text-red-500 text-sm mt-1">{errors.Id_Insumos}</p>
                            )}
                    </>
                )}

                {formData.Id_Categoria_Producto != 3 && (
                    <>
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
                    </>
                )}
                </div>

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

                <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg md:col-span-2 m-7 mt-2">
                    <h3 className="text-2xl text-black font-bold mb-4">
                        Imágenes del Producto
                    </h3>

                    <div className="mb-6 w-full">
                        <p className="text-lg font-semibold text-gray-800 mb-2">Imágenes actuales:</p>
                        <div className="flex flex-wrap gap-4">
                            {imagenesExistentes.length > 0 ? (
                                imagenesExistentes.map((img, idx) => (
                                    <div key={`existente-${idx}`} className="relative w-[200px] h-[200px] border rounded shadow">
                                        <img src={img.URL} alt={`img-${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute top-1 right-1">
                                            <Button
                                                onClick={() => removeImagenExistente(img.Id_Imagenes)}
                                                className="red"
                                                icon="fa-times"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No hay imágenes existentes</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6 w-full">
                        <p className="text-lg font-semibold text-gray-800 mb-2">Nuevas imágenes seleccionadas:</p>
                        <div className="flex flex-wrap gap-4">
                            {imagenesNuevas.length > 0 ? (
                                imagenesNuevas.map((file, idx) => (
                                    <div key={`nueva-${idx}`} className="relative w-[200px] h-[200px] border rounded shadow">
                                        <img src={URL.createObjectURL(file)} alt={`nueva-${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute top-1 right-1">
                                            <Button
                                                onClick={() => removeNuevaImagen(idx)}
                                                className="red"
                                                icon="fa-times"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No se han seleccionado nuevas imágenes</p>
                            )}
                        </div>
                    </div>

                    <div className="relative inline-block mt-2">
                        <Button
                            className="blue"
                            icon="fa-upload"
                            disabled={imagenesExistentes.length + imagenesNuevas.length >= maxImagenes}
                        >
                            <div className="flex items-center gap-2">Seleccionar Imágenes</div>
                        </Button>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={imagenesExistentes.length + imagenesNuevas.length >= maxImagenes}
                        />
                    </div>

                    {errors.imagenes && <p className="text-red-500 text-sm mt-2">{errors.imagenes}</p>}
                </div>

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

export default EditarProducto;