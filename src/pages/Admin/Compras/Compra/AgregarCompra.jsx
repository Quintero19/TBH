import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { comprasService } from "@/service/compras.service";
import { proveedorService } from "@/service/proveedores.service";
import { productoService } from "@/service/productos.service";
import { insumoService } from "@/service/insumo.service";

const AgregarCompra = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [errorProveedor, setErrorProveedor] = useState(false);

    const [formData, setFormData] = useState({
        Id_Proveedores: ""
    });

    const [listaDetalles, setListaDetalles] = useState([]);
    const [detalleActual, setDetalleActual] = useState({
        tipo: "Insumo",
        idItemSeleccionado: "",
        cantidad: 1,
        precio: 0,
        tallas: [],
    });

    const obtenerDatos = useCallback(async () => {
        try {
            const [resProveedores, resInsumos, resProductos] = await Promise.all([
                proveedorService.obtenerProveedoresActivos(),
                insumoService.obtenerInsumosActivos(),
                productoService.obtenerProductosCompras(),
            ]);
            setProveedores(transformData(resProveedores.data));
            setInsumos(resInsumos.data);
            setProductos(resProductos.data);
        } catch (error) {
            console.error(error);
            showAlert("Error cargando Datos ", { type: "error",  duration: 2000 });
        }
    }, []);

    useEffect(() => {
        obtenerDatos();
    }, [obtenerDatos]);

    const manejarCambioDetalle = (e) => {
        const { name, value } = e.target;
        setDetalleActual((prev) => ({
            ...prev,
            [name]: ["precio", "cantidad"].includes(name) ? Number(value) : value,
        }));
    };


    const transformData = useCallback(
        (data) =>
            data.map((item) => {
                const isEmpresa = item.Tipo_Proveedor === "Empresa";
                return {
                    ...item,
                    Nombre: isEmpresa ? item.Nombre_Empresa : item.Nombre,
                };
            }),
        [],
    );

    useEffect(() => {
        if (detalleActual.tipo === "Producto" && detalleActual.idItemSeleccionado) {
            const productoSeleccionado = productos.find(
                (p) => p.Id_Productos === +detalleActual.idItemSeleccionado
            );
            if (productoSeleccionado?.Es_Ropa) {
                setDetalleActual((prev) => ({
                    ...prev,
                    tallas: productoSeleccionado.Detalles.tallas.map((t) => ({
                        id: t.Id_Producto_Tallas,
                        nombre: t.Nombre,
                        cantidad: 0,
                    })),
                }));
            } else {
                setDetalleActual((prev) => ({ ...prev, tallas: [] }));
            }
        }
    }, [detalleActual.tipo, detalleActual.idItemSeleccionado, productos]);

    const actualizarCantidadTalla = (index, cantidad) => {
        setDetalleActual((prev) => {
            const tallasActualizadas = [...prev.tallas];
            tallasActualizadas[index].cantidad = +cantidad;
            return { ...prev, tallas: tallasActualizadas };
        });
    };

    const agregarDetalleCompra = () => {
        if (!detalleActual.idItemSeleccionado) {
            return showAlert("Selecciona un insumo o producto", { type: "warning", title: "Cuidado!", duration: 2000 });
        }

        if (detalleActual.cantidad <= 0) {
            return showAlert("La cantidad debe ser mayor que 0", { type: "warning", title: "Cuidado!", duration: 2000 });
        }

        if (detalleActual.precio <= 0) {
            return showAlert("El precio debe ser mayor que 0", { type: "warning", title: "Cuidado!", duration: 2000 });
        }

        const yaExiste = listaDetalles.some((d) =>
            detalleActual.tipo === "Insumo"
                ? d.Id_Insumos === +detalleActual.idItemSeleccionado
                : d.Id_Productos === +detalleActual.idItemSeleccionado
        );

        if (yaExiste) {
            return showAlert(`Este ${detalleActual.tipo.toLowerCase()} ya fue agregado`, {
                type: "error",
                duration: 2000,
            });
        }

        const nuevoDetalle = {
            Cantidad: Number(detalleActual.cantidad),
            Subtotal: Number(detalleActual.precio),
        };

        if (detalleActual.tipo === "Insumo") {
            nuevoDetalle.Id_Insumos = +detalleActual.idItemSeleccionado;
        } else {
            nuevoDetalle.Id_Productos = +detalleActual.idItemSeleccionado;
            if (detalleActual.tallas.length) {
                const totalTallas = detalleActual.tallas.reduce((suma, t) => suma + t.cantidad, 0);
                if (totalTallas !== nuevoDetalle.Cantidad) {
                    return showAlert("La suma de tallas debe coincidir con la cantidad total", {
                        type: "error",
                    });
                }
                nuevoDetalle.tallas = detalleActual.tallas
                    .filter((t) => t.cantidad > 0)
                    .map((t) => ({
                        Id_Producto_Tallas: t.id,
                        Cantidad: t.cantidad,
                    }));
            }
        }

        setListaDetalles((prev) => [...prev, nuevoDetalle]);

        setDetalleActual({
            tipo: "Insumo",
            idItemSeleccionado: "",
            cantidad: 1,
            precio: 0,
            tallas: [],
        });
    };

    const eliminarDetalleCompra = (index) => {
        setListaDetalles((prev) => prev.filter((_, i) => i !== index));
    };

    const totalCompra = listaDetalles.reduce((suma, d) => suma + d.Subtotal, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.Id_Proveedores) {
            setErrorProveedor(true);
            return;
        }


        if (!listaDetalles.length) {
            return showAlert("Agrega al menos un producto o insumo", { type: "error" });
        }

        const nuevaCompra = {
            ...formData,
            detalles: listaDetalles,
        };

        try {
            await comprasService.crearCompra(nuevaCompra);
            showAlert("Compra registrada con éxito", { title: "¡Éxito!", type: "success", duration: 2000, }).then(() =>
                navigate("/admin/compras")
            );
        } catch (error) {
            console.error(error);
            showAlert("Error al registrar la compra", { type: "error" });
        }
    };

    const handleCancel = () => {
        window.showAlert("Si cancelas, perderás los datos ingresados.", {
                title: "¿Estás seguro?",
                type: "warning",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "Continuar Registrando",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    navigate("/admin/compras");
                }
            });
    };

    return (
        <>
            <h1 className="text-5xl ml-10 font-bold mb-5 text-black">Registrar Compra</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10">

                <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold mb-3 text-black">
                        Proveedor <span className="text-red-500">*</span>
                    </h3>
                    <Select
                        placeholder="Seleccione un proveedor"
                        isClearable
                        options={proveedores.map((prov) => ({
                            value: prov.Id_Proveedores,
                            label: prov.Nombre,
                        }))}
                        value={
                            formData.Id_Proveedores
                                ? {
                                    value: formData.Id_Proveedores,
                                    label:
                                        proveedores.find((p) => p.Id_Proveedores === formData.Id_Proveedores)?.Nombre || "",
                                }
                                : null
                        }
                        onChange={(opcion) => {
                            setFormData((prev) => ({
                                ...prev,
                                Id_Proveedores: opcion ? opcion.value : "",
                            }));
                            setErrorProveedor(!opcion);
                        }}
                    />
                    {errorProveedor && <p className="text-red-500 text-sm mt-1">Debes seleccionar un proveedor</p>}
                </div>

                <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold mb-3 text-black">Fecha</h3>
                    <input
                        type="date"
                        value={new Date().toISOString().slice(0, 10)}
                        disabled
                        className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed text-gray-500"
                    />
                </div>

                <div className="bg-white p-6 rounded shadow border border-gray-200 md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold">Agregar Productos / Insumos</h2>

                    <div className="grid grid-cols-6 gap-4 items-end">

                        <div className="col-span-1">
                            <h3 className="text-xl font-bold mb-3 text-black">Tipo</h3>
                            <Select
                                name="tipo"
                                options={[
                                    { value: "Insumo", label: "Insumo" },
                                    { value: "Producto", label: "Producto" },
                                ]}
                                value={{ value: detalleActual.tipo, label: detalleActual.tipo }}
                                onChange={(opcion) =>
                                    setDetalleActual((prev) => ({
                                        ...prev,
                                        tipo: opcion.value,
                                        idItemSeleccionado: "",
                                        tallas: [],
                                    }))
                                }
                            />
                        </div>

                        <div className="col-span-2">
                            <h3 className="text-xl font-bold mb-3 text-black">{detalleActual.tipo}</h3>
                            <Select
                                placeholder={`Seleccione un ${detalleActual.tipo}`}
                                isClearable
                                options={
                                    detalleActual.tipo === "Insumo"
                                        ? insumos.map((ins) => ({
                                            value: ins.Id_Insumos,
                                            label: ins.Nombre,
                                        }))
                                        : productos.map((prod) => ({
                                            value: prod.Id_Productos,
                                            label: `${prod.Categoria} - ${prod.Nombre}`,
                                        }))
                                }
                                value={
                                    detalleActual.idItemSeleccionado
                                        ? {
                                            value: +detalleActual.idItemSeleccionado,
                                            label:
                                                detalleActual.tipo === "Insumo"
                                                    ? insumos.find((i) => i.Id_Insumos === +detalleActual.idItemSeleccionado)
                                                        ?.Nombre
                                                    : (() => {
                                                        const p = productos.find((x) => x.Id_Productos === +detalleActual.idItemSeleccionado);
                                                        return `${p?.Categoria} - ${p?.Nombre}`;
                                                    })(),
                                        }
                                        : null
                                }
                                onChange={(opcion) =>
                                    setDetalleActual((prev) => ({
                                        ...prev,
                                        idItemSeleccionado: opcion ? Number(opcion.value) : "",
                                        tallas: [],
                                    }))
                                }
                            />
                        </div>

                        <div className="col-span-1">
                            <h3 className="text-xl font-bold mb-3 text-black">Cantidad</h3>
                            <input
                                type="number"
                                name="cantidad"
                                min="1"
                                value={detalleActual.cantidad}
                                onChange={manejarCambioDetalle}
                                className="border p-2 rounded w-full h-[38px]"
                            />
                        </div>

                        <div className="col-span-1">
                            <h3 className="text-xl font-bold mb-3 text-black">Subtotal</h3>
                            <input
                                type="number"
                                name="precio"
                                min="0"
                                value={detalleActual.precio}
                                onChange={manejarCambioDetalle}
                                className="border p-2 rounded w-full h-[38px]"
                            />
                        </div>

                        <div className="col-span-1">
                            <Button icon="fa-plus" className="green" onClick={agregarDetalleCompra}>
                                <div className="flex items-center gap-2">Agregar</div>
                            </Button>
                        </div>
                    </div>

                    {detalleActual.tipo === "Producto" && detalleActual.tallas.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {detalleActual.tallas.map((talla, i) => (
                                <div key={i}>
                                    <label className="block">{talla.nombre}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={talla.cantidad}
                                        onChange={(e) => actualizarCantidadTalla(i, e.target.value)}
                                        className="border p-2 rounded w-full h-[38px]"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {listaDetalles.some((d) => d.Id_Productos) && (
                    <div className="md:col-span-2 mt-6">
                        <h2 className="text-2xl font-bold mb-4">Productos con Tallas</h2>
                        <div className="overflow-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="p-2">Producto</th>
                                        <th className="p-2">Cantidad</th>
                                        <th className="p-2">Tallas</th>
                                        <th className="p-2">Precio Unidad</th>
                                        <th className="p-2">Subtotal</th>
                                        <th className="p-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaDetalles.filter((d) => d.Id_Productos).map((d, i) => {
                                        const producto = productos.find((p) => p.Id_Productos === d.Id_Productos);
                                        return (
                                            <tr key={i} className="border-b">
                                                <td className="p-2">{producto?.Nombre}</td>
                                                <td className="p-2">{d.Cantidad}</td>
                                                <td className="p-2">
                                                    {d.tallas
                                                        ?.filter((t) => t.Cantidad > 0)
                                                        .map((t) => {
                                                            const nombreTalla = producto?.Detalles.tallas.find(
                                                                (x) => x.Id_Producto_Tallas === t.Id_Producto_Tallas
                                                            )?.Nombre;
                                                            return `${nombreTalla}: ${t.Cantidad}`;
                                                        })
                                                        .join(", ")}
                                                </td>
                                                <td className="p-2">${(d.Subtotal / d.Cantidad).toFixed(2)}</td>
                                                <td className="p-2">${d.Subtotal.toLocaleString()}</td>
                                                <td className="p-2">
                                                    <Button className="red" onClick={() => eliminarDetalleCompra(i)}>
                                                        <div className="flex items-center gap-2">Eliminar</div>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {listaDetalles.some((d) => d.Id_Insumos) && (
                    <div className="md:col-span-2 mt-6">
                        <h2 className="text-2xl font-bold mb-4">Insumos en la Compra</h2>
                        <div className="overflow-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="p-2">Insumo</th>
                                        <th className="p-2">Cantidad</th>
                                        <th className="p-2">Precio Unidad</th>
                                        <th className="p-2">Subtotal</th>
                                        <th className="p-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listaDetalles.filter((d) => d.Id_Insumos).map((d, i) => {
                                        const insumo = insumos.find((x) => x.Id_Insumos === d.Id_Insumos);
                                        return (
                                            <tr key={i} className="border-b">
                                                <td className="p-2">{insumo?.Nombre}</td>
                                                <td className="p-2">{d.Cantidad}</td>
                                                <td className="p-2">${(d.Subtotal / d.Cantidad).toFixed(2)}</td>
                                                <td className="p-2">${d.Subtotal.toLocaleString()}</td>
                                                <td className="p-2">
                                                    <Button className="red" onClick={() => eliminarDetalleCompra(i)}>
                                                        <div className="flex items-center gap-2">Eliminar</div>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="md:col-span-2 text-left text-xl font-bold mt-4">
                    Total: ${totalCompra.toLocaleString()}
                </div>

                <div className="md:col-span-2 flex justify-start gap-4 mt-4">
                    <Button type="submit" className="green" icon="fa-save" disabled={errorProveedor}>
                        <div className="flex items-center gap-2">Guardar</div>
                    </Button>
                    <Button type="button" className="red" icon="fa-times" onClick={handleCancel}>
                        <div className="flex items-center gap-2">Cancelar</div>
                    </Button>
                </div>
            </form>
        </>

    );
};

export default AgregarCompra;
