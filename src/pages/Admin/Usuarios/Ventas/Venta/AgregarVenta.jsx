import React, { useEffect, useState } from "react";
import Select from "react-select";
import api from "@/utils/api";
import Button from "@/components/Buttons/Button";
import { useNavigate } from "react-router-dom";
import { empleadoService } from "@/service/empleado.service";
import { rolService } from "@/service/roles.service";
import { clienteService } from "@/service/clientes.service";
import { showAlert } from "@/components/AlertProvider";
import { ventasService } from "@/service/ventas.service";


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
        Referencia:"",
        Items: []
    });

    const [errorCliente, setErrorCliente] = useState(false);
    const [errorMetodoPago, setErrorMetodoPago] = useState(false);
    const [errorReferencia, setErrorReferencia] = useState(false);

    // Estado para el formulario de agregar items
    const [tipoItem, setTipoItem] = useState("producto");
    const [itemSeleccionado, setItemSeleccionado] = useState({ id: "", nombre: "", precio: 0 });
    const [cantidad, setCantidad] = useState(1);
    const navigate = useNavigate();














    useEffect(() => {
        const fetchData = async () => {
            try {
                const resUsuario = await api.get("/me/");
                const user = resUsuario.data?.user;
                const today = new Date().toISOString().split("T")[0];
                let nombreUsuario = "Desconocido";

                // Buscar el nombre del usuario
                if (user?.rol_id === 89 && user?.documento) {
                    try {
                        const empleado = await empleadoService.listarEmpleadoPorDocumento(user.documento);
                        nombreUsuario = empleado?.Nombre || "Empleado no encontrado";
                    } catch (err) {
                        console.warn("Empleado no encontrado:", err);
                    }
                } else {
                    try {
                        const rol = await rolService.obtenerRolPorId(user.rol_id);
                        nombreUsuario = rol?.Nombre || rol?.data?.Nombre || "Rol desconocido";
                    } catch (err) {
                        console.warn("Rol no encontrado:", err);
                    }
                }

                // Establecer usuario
                setUsuario({
                    id: user?.id || "",
                    nombre: nombreUsuario,
                });

                // Obtener clientes
                const resClientes = await clienteService.listarClientes();
                setClientes(resClientes.data || []);

                // Productos
                const resProductos = await api.get("/productos");
                if (Array.isArray(resProductos.data?.data)) {
                    setProductosDisponibles(resProductos.data.data);
                } else {
                    console.warn("Formato de productos inválido:", resProductos.data);
                    setProductosDisponibles([]);
                }

                // Servicios
                const resServicios = await api.get("/servicios");
                if (Array.isArray(resServicios.data?.data)) {
                    setServiciosDisponibles(resServicios.data.data);
                } else {
                    console.warn("Formato de servicios inválido:", resServicios.data);
                    setServiciosDisponibles([]);
                }

                setFormData((prev) => ({
                    ...prev,
                    Id_Usuario: user?.id || "",
                    Fecha_Registro: today,
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

    const getOpcionesItems = () => {
    try {
        const items = tipoItem === "producto" 
            ? productosDisponibles 
            : serviciosDisponibles;

        if (!Array.isArray(items) || items.length === 0) {
            // console.warn(`No hay ${tipoItem === "producto" ? "productos" : "servicios"} disponibles`);
            return [];
        }

        return items.map(item => {
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

        const calcularTotal = () => {
            return formData.Items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        };

        const handleCancel = () => {
        showAlert("Si cancelas, perderás los datos ingresados.", {
            type: "warning",
            title: "¿Cancelar?",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "No, continuar",
        }).then((r) => {
            if (r.isConfirmed) {
                setFormData({
                    Id_Cliente: "",
                    Id_Usuario: usuario.id,
                    Fecha_Registro: formData.Fecha_Registro,
                    Metodo_Pago: "",
                    Items: [],
                });
                setErrorCliente(false);
                setErrorMetodoPago(false);
                navigate("/admin/ventas");
            }
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

        if (formData.Metodo_Pago === "Transferencia" && !formData.DatosTransferencia?.trim()) {
            await showAlert("Debes ingresar una referencia para pagos por transferencia", {
                type: "warning",
                title: "Falta información"
            });
            return;
        }


        if (formData.Items.length === 0) {
            await showAlert("Debes agregar al menos un producto o servicio", {
                type: "warning",
                title: "Falta información"
            });
            return;
        }

        const hayItemDuplicado = formData.Items.some(
            item => item.tipo !== "producto" && item.tipo !== "servicio"
            );

            if (hayItemDuplicado) {
            await showAlert("Cada ítem debe ser solo producto o servicio, no ambos ni indefinido.", {
                type: "warning",
                title: "Datos incorrectos"
            });
            return;
            }


        try {

            const ventaData = {
                Id_Cliente: formData.Id_Cliente,
                Id_Empleados: formData.Id_Usuario,
                Fecha: formData.Fecha_Registro,
                M_Pago: formData.Metodo_Pago,
                Referencia: formData.Metodo_Pago === "Transferencia" ? formData.DatosTransferencia : null,
                Detalle_Venta: formData.Items.map((item) => ({
                    Id_Productos: item.tipo === "producto" ? item.id : null,
                    Id_Servicio: item.tipo === "servicio" ? item.id : null,
                    Cantidad: item.cantidad,
                    Precio: item.precio,
                    Subtotal: item.precio * item.cantidad,
                    Id_Producto_Tallas: null,
                    Id_Producto_Tamano_Insumos: null,
                }))
            };

            // console.log("VENTA A ENVIAR ===>", JSON.stringify(ventaData, null, 2));

            await ventasService.crearVenta(ventaData);

            await showAlert("Venta registrada exitosamente", {
                type: "success",
                duration: 1500,
            });

            navigate("/admin/ventas");
        } catch (error) {
            console.error("Error al registrar la venta:", error);
            const mensaje = error.response?.data?.message || "Error al registrar la venta";
            await showAlert(mensaje, {
                title: "Error",
                icon: "error",
            });
        }
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
                    { value: "Transferencia", label: "Transferencia" },
                    ]}
                    value={
                    formData.Metodo_Pago
                        ? { value: formData.Metodo_Pago, label: formData.Metodo_Pago }
                        : null
                    }
                    onChange={(opcion) => {
                    const metodo = opcion ? opcion.value : "";
                    setFormData((prev) => ({
                        ...prev,
                        Metodo_Pago: metodo,
                        DatosTransferencia: metodo === "Transferencia" ? prev.DatosTransferencia : "",
                    }));
                    setErrorMetodoPago(!opcion);
                    setErrorReferencia(false);
                    }}
                />

                {errorMetodoPago && (
                    <p className="text-red-500 text-sm mt-1">
                    Debes seleccionar un método de pago
                    </p>
                )}

                {/* Solo se muestra si selecciona Transferencia */}
                {formData.Metodo_Pago === "Transferencia" && (
                    <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencia<span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    className={`w-full border rounded p-2 ${
                        errorReferencia ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ej: ABC123"
                    value={formData.DatosTransferencia}
                    onChange={(e) => {
                        const valor = e.target.value;
                        const limpio = valor.replace(/[^a-zA-Z0-9]/g, "");
                        setFormData((prev) => ({
                        ...prev,
                        DatosTransferencia: limpio,
                        }));
                        setErrorReferencia(valor !== limpio);
                    }}
                    />
                    {errorReferencia && (
                    <p className="text-red-500 text-sm mt-1">
                        Solo se permiten letras y números (sin espacios ni símbolos).
                    </p>
                    )}
                    </div>
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
                    <div className="bg-white p-6 rounded shadow border border-gray-200 md:col-span-2 space-y-4">
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
                                        <th className="p-2 text-center">Acciones</th>
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
                                                    placeholder="0"
                                                    value={item.precio !== 0 ? parseFloat(item.precio).toString() : ""}
                                                    onChange={(e) => actualizarPrecio(index, e.target.value)}
                                                    className="w-36 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-right shadow-sm transition-all"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </td>

                                            <td className="p-2 text-right">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="1"
                                                    value={item.cantidad || ""}
                                                    onChange={(e) => actualizarCantidad(index, e.target.value)}
                                                    className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-right shadow-sm transition-all"
                                                    onKeyDown={(e) => {
                                                        if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                    }}
                                                />
                                            </td>
                                            <td className="p-2 text-right">
                                                ${(item.precio * item.cantidad).toLocaleString("es-CO", {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className="p-2 text-center">
                                                <div className="flex justify-center">
                                                    <Button
                                                        onClick={() => eliminarItem(index)}
                                                        className="red"
                                                        icon="fa-times"
                                                    >
                                                        <div className="flex items-center gap-2">Eliminar</div>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold">
                                        <td colSpan="4" className="p-2 text-right">Total:</td>
                                        <td className="p-2 text-right">
                                            ${calcularTotal().toLocaleString("es-CO", {
                                                minimumFractionDigits: 0,
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
                        onClick={handleCancel}
                    >
                        <div className="flex items-center gap-2">Cancelar</div>
                    </Button>
                </div>
            </form>
            <br />
            <br />
        </>
    );
};

export default AgregarVenta;