import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "@/utils/api";
import { clienteService } from "@/service/clientes.service";
import Button from "@/components/Buttons/Button";

const AgregarVenta = () => {
    const [clientes, setClientes] = useState([]);
    const [productosDisponibles, setProductosDisponibles] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
    const [usuario, setUsuario] = useState({ id: "", nombre: "" });

    const [formData, setFormData] = useState({
        Id_Cliente: "",
        Id_Usuario: "",
        Fecha_Registro: "",
        Metodo_Pago: "",
        Items: []
    });

    const [errorCliente, setErrorCliente] = useState(false);
    const [errorMetodoPago, setErrorMetodoPago] = useState(false);

    // Estado para el formulario de agregar items
    const [tipoItem, setTipoItem] = useState("producto");
    const [itemSeleccionado, setItemSeleccionado] = useState({ id: "", nombre: "", precio: 0 });
    const [cantidad, setCantidad] = useState(1);

    useEffect(() => {
    const fetchData = async () => {
        try {
            // Obtener usuario actual
            const resUsuario = await api.get("/me/");
            setUsuario({
                id: resUsuario.data?.user?.id || "",
                nombre: resUsuario.data?.user?.correo || "",
            });

            // Obtener clientes
            const resClientes = await clienteService.listarClientes();
            setClientes(resClientes.data || []);

            // Obtener productos desde la base de datos
            const resProductos = await api.get("/productos");
            if (resProductos.data && Array.isArray(resProductos.data)) {
                setProductosDisponibles(resProductos.data);
            } else {
                console.error("Formato de productos inválido:", resProductos.data);
                setProductosDisponibles([]);
            }

            // Obtener servicios desde la base de datos
            const resServicios = await api.get("/servicios");
            if (resServicios.data && Array.isArray(resServicios.data)) {
                setServiciosDisponibles(resServicios.data);
            } else {
                console.error("Formato de servicios inválido:", resServicios.data);
                setServiciosDisponibles([]);
            }

            // Setear fecha actual
            const today = new Date();
            const fecha = today.toISOString().split("T")[0];

            setFormData(prev => ({
                ...prev,
                Id_Usuario: resUsuario.data?.user?.id || "",
                Fecha_Registro: fecha
            }));
        } catch (error) {
            console.error("Error al obtener datos:", error);
            setClientes([]);
            setProductosDisponibles([]);
            setServiciosDisponibles([]);
        }
    };

    fetchData();
}, []);






    // Función para obtener opciones de productos/servicios de forma segura
    const getOpcionesItems = () => {
    try {
        // Obtener los items según el tipo seleccionado
        const items = tipoItem === "producto" 
            ? productosDisponibles 
            : serviciosDisponibles;

        // Verificar que sea un array y tenga datos
        if (!Array.isArray(items) || items.length === 0) {
            console.warn(`No hay ${tipoItem === "producto" ? "productos" : "servicios"} disponibles`);
            return [];
        }

        // Mapear los items a formato para el Select
        return items.map(item => {
            // Asegurar que los campos existan
            const id = tipoItem === "producto" 
                ? item.Id_Productos || item.id || ""
                : item.Id_Servicios || item.id || "";

            const nombre = item.Nombre || item.nombre || "Sin nombre";
            const precio = item.Precio || item.precio || 0;

            return {
                value: id,
                label: `${nombre} - $${precio.toLocaleString("es-CO")}`,
                precio: precio
            };
        });
    } catch (error) {
        console.error("Error al obtener opciones de items:", error);
        return [];
    }
};



















    const agregarItem = () => {
        if (!itemSeleccionado.id || cantidad <= 0) return;

        const nuevoItem = {
            tipo: tipoItem,
            id: itemSeleccionado.id,
            nombre: itemSeleccionado.nombre,
            precio: itemSeleccionado.precio,
            cantidad: cantidad
        };

        setFormData(prev => ({
            ...prev,
            Items: [...prev.Items, nuevoItem]
        }));

        // Resetear formulario de item
        setItemSeleccionado({ id: "", nombre: "", precio: 0 });
        setCantidad(1);
    };

    const eliminarItem = (index) => {
        setFormData(prev => ({
            ...prev,
            Items: prev.Items.filter((_, i) => i !== index)
        }));
    };

    const actualizarCantidad = (index, nuevaCantidad) => {
        if (nuevaCantidad <= 0) return;

        setFormData(prev => {
            const nuevosItems = [...prev.Items];
            nuevosItems[index].cantidad = Number(nuevaCantidad);
            return { ...prev, Items: nuevosItems };
        });
    };

    const actualizarPrecio = (index, nuevoPrecio) => {
        if (nuevoPrecio < 0) return;

        setFormData(prev => {
            const nuevosItems = [...prev.Items];
            nuevosItems[index].precio = Number(nuevoPrecio);
            return { ...prev, Items: nuevosItems };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.Id_Cliente) {
            setErrorCliente(true);
            return;
        }
        
        if (!formData.Metodo_Pago) {
            setErrorMetodoPago(true);
            return;
        }

        if (formData.Items.length === 0) {
            alert("Debes agregar al menos un producto o servicio");
            return;
        }

        try {
            // Calcular total
            const total = formData.Items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
            
            const ventaData = {
                ...formData,
                Total: total,
                Detalles: formData.Items.map(item => ({
                    Id_Producto: item.tipo === "producto" ? item.id : null,
                    Id_Servicio: item.tipo === "servicio" ? item.id : null,
                    Cantidad: item.cantidad,
                    Precio_Unitario: item.precio,
                    Subtotal: item.precio * item.cantidad
                }))
            };

            console.log("Datos a enviar:", ventaData);
            // Descomenta cuando tengas el servicio configurado
            // const response = await api.post("/ventas/", ventaData);
            // console.log("Venta creada:", response.data);
            alert("Venta registrada exitosamente");
            // Aquí podrías redirigir o resetear el formulario
        } catch (error) {
            console.error("Error al registrar la venta:", error);
            alert("Error al registrar la venta");
        }
    };

    const calcularTotal = () => {
        return formData.Items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    return (
        <>
            <h1 className="text-5xl ml-10 font-bold mb-5 text-black">Registrar Venta</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10">
                {/* Selector de Cliente */}
                <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold mb-3 text-black">
                        Cliente <span className="text-red-500">*</span>
                    </h3>
                    <Select
                        placeholder="Seleccione un cliente"
                        isClearable
                        options={clientes.map((cliente) => ({
                            value: cliente.Id_Cliente || "",
                            label: cliente.Nombre || "",
                        }))}
                        value={
                            formData.Id_Cliente
                                ? {
                                    value: formData.Id_Cliente,
                                    label: clientes.find((c) => c.Id_Cliente === formData.Id_Cliente)?.Nombre || "",
                                }
                                : null
                        }
                        onChange={(opcion) => {
                            setFormData((prev) => ({
                                ...prev,
                                Id_Cliente: opcion ? opcion.value : "",
                            }));
                            setErrorCliente(!opcion);
                        }}
                    />
                    {errorCliente && (
                        <p className="text-red-500 text-sm mt-1">Debes seleccionar un cliente</p>
                    )}
                </div>

                {/* Método de Pago */}
                <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold mb-3 text-black">
                        Método de Pago <span className="text-red-500">*</span>
                    </h3>
                    <Select
                        placeholder="Seleccione un método de pago"
                        isClearable
                        options={[
                            { value: "Efectivo", label: "Efectivo" },
                            { value: "Transferencia", label: "Transferencia" }
                        ]}
                        value={
                            formData.Metodo_Pago
                                ? {
                                    value: formData.Metodo_Pago,
                                    label: formData.Metodo_Pago,
                                }
                                : null
                        }
                        onChange={(opcion) => {
                            setFormData((prev) => ({
                                ...prev,
                                Metodo_Pago: opcion ? opcion.value : "",
                            }));
                            setErrorMetodoPago(!opcion);
                        }}
                    />
                    {errorMetodoPago && (
                        <p className="text-red-500 text-sm mt-1">Debes seleccionar un método de pago</p>
                    )}
                </div>

                {/* Usuario que registra */}
                <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold mb-3 text-black">Registrado por</h3>
                    <input
                        type="text"
                        value={usuario.nombre || ""}
                        readOnly
                        className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed text-gray-500"
                    />
                </div>

                {/* Fecha actual */}
                <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold mb-3 text-black">Fecha de registro</h3>
                    <input
                        type="date"
                        value={formData.Fecha_Registro}
                        disabled
                        className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed text-gray-500"
                    />
                </div>

                {/* Sección para agregar productos/servicios */}
                <div className="bg-white p-6 rounded shadow border border-gray-200 md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold">Agregar Productos/Servicios</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Selector de Tipo */}
                        <div>
                            <h3 className="text-xl font-bold mb-3 text-black">
                                Tipo <span className="text-red-500">*</span>
                            </h3>
                            <Select
                                options={[
                                    { value: "producto", label: "Producto" },
                                    { value: "servicio", label: "Servicio" }
                                ]}
                                value={{ value: tipoItem, label: tipoItem === "producto" ? "Producto" : "Servicio" }}
                                onChange={(opcion) => {
                                    setTipoItem(opcion.value);
                                    setItemSeleccionado({ id: "", nombre: "", precio: 0 });
                                }}
                            />
                        </div>

                        {/* Selector de Producto/Servicio */}
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold mb-3 text-black">
                                {tipoItem === "producto" ? "Producto" : "Servicio"} <span className="text-red-500">*</span>
                            </h3>
                            <Select
                                placeholder={`Seleccione un ${tipoItem === "producto" ? "producto" : "servicio"}`}
                                options={getOpcionesItems()}
                                value={
                                    itemSeleccionado.id
                                        ? {
                                            value: itemSeleccionado.id,
                                            label: `${itemSeleccionado.nombre} - $${itemSeleccionado.precio.toLocaleString("es-CO")}`
                                        }
                                        : null
                                }
                                onChange={(opcion) => {
                                    if (opcion) {
                                        setItemSeleccionado({
                                            id: opcion.value,
                                            nombre: opcion.label.split(" - ")[0],
                                            precio: opcion.precio
                                        });
                                    } else {
                                        setItemSeleccionado({ id: "", nombre: "", precio: 0 });
                                    }
                                }}
                            />
                        </div>

                        {/* Cantidad */}
                        <div>
                            <h3 className="text-xl font-bold mb-3 text-black">
                                Cantidad <span className="text-red-500">*</span>
                            </h3>
                            <input
                                type="number"
                                min="1"
                                value={cantidad === 0 ? "" : cantidad}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                className="w-full border p-2 rounded h-[38px]"
                                onKeyDown={(e) => {
                                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                }}
                            />
                        </div>

                        {/* Botón Agregar */}
                        <div className="md:col-span-4 flex justify-end">
                            <Button
                                type="button"
                                onClick={agregarItem}
                                className="green"
                                icon="fa-plus"
                                disabled={!itemSeleccionado.id || cantidad <= 0}
                            >
                                <div className="flex items-center gap-2">Agregar</div>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabla de productos/servicios agregados */}
                {formData.Items.length > 0 && (
                    <div className="md:col-span-2 mt-6">
                        <h2 className="text-2xl font-bold mb-4">Items en la Venta</h2>
                        <div className="overflow-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="p-2 text-left">Tipo</th>
                                        <th className="p-2 text-left">Nombre</th>
                                        <th className="p-2 text-right">Precio Unitario</th>
                                        <th className="p-2 text-right">Cantidad</th>
                                        <th className="p-2 text-right">Subtotal</th>
                                        <th className="p-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.Items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{item.tipo === "producto" ? "Producto" : "Servicio"}</td>
                                            <td className="p-2">{item.nombre}</td>
                                            <td className="p-2 text-right">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.precio === 0 ? "" : item.precio}
                                                    onChange={(e) => actualizarPrecio(index, e.target.value)}
                                                    className="w-24 border p-1 rounded text-right"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </td>
                                            <td className="p-2 text-right">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.cantidad === 0 ? "" : item.cantidad}
                                                    onChange={(e) => actualizarCantidad(index, e.target.value)}
                                                    className="w-20 border p-1 rounded text-right"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </td>
                                            <td className="p-2 text-right">
                                                ${(item.precio * item.cantidad).toLocaleString("es-CO", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className="p-2 text-center">
                                                <Button
                                                    onClick={() => eliminarItem(index)}
                                                    className="red"
                                                    icon="fa-times"
                                                >
                                                    <div className="flex items-center gap-2">Eliminar</div>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold">
                                        <td colSpan="4" className="p-2 text-right">Total:</td>
                                        <td className="p-2 text-right">
                                            ${calcularTotal().toLocaleString("es-CO", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="md:col-span-2 flex justify-start gap-4 mt-4">
                    <Button
                        type="submit"
                        className="green"
                        icon="fa-save"
                        disabled={errorCliente || errorMetodoPago || formData.Items.length === 0}
                    >
                        <div className="flex items-center gap-2">Guardar Venta</div>
                    </Button>
                    <Button
                        type="button"
                        className="red"
                        icon="fa-times"
                        onClick={() => {
                            // Resetear formulario
                            setFormData({
                                Id_Cliente: "",
                                Id_Usuario: usuario.id,
                                Fecha_Registro: formData.Fecha_Registro,
                                Metodo_Pago: "",
                                Items: []
                            });
                            setErrorCliente(false);
                            setErrorMetodoPago(false);
                        }}
                    >
                        <div className="flex items-center gap-2">Cancelar</div>
                    </Button>
                </div>
            </form>
        </>
    );
};

export default AgregarVenta;