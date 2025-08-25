import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showAlert } from "@/components/AlertProvider";
import Button from "@/components/Buttons/Button";
import { devolucionService } from "@/service/devolucion.service";
import { clienteService } from "@/service/clientes.service";
import Select from "react-select";

const AgregarDevolucion = () => {
  const navigate = useNavigate();
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [comprasRopa, setComprasRopa] = useState([]);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [errorCompras, setErrorCompras] = useState(null);

  const [formData, setFormData] = useState({
    Id_Cliente: "",
    Fecha: new Date().toISOString().split("T")[0],
    Motivo: "",
    productos: []
  });

  // Obtener lista de clientes
  const fetchClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const response = await clienteService.listarClientes();
      
      // Manejar diferentes formatos de respuesta
      let clientesData = [];
      if (Array.isArray(response)) {
        clientesData = response;
      } else if (response && response.data) {
        clientesData = response.data;
      } else if (response && Array.isArray(response.clientes)) {
        clientesData = response.clientes;
      }
      
      setClientes(clientesData);
    } catch (error) {
      showAlert("Error al cargar clientes", { type: "error" });
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  // Obtener compras de ropa del cliente
  const fetchComprasRopa = useCallback(async (idCliente) => {
    if (!idCliente) {
      setComprasRopa([]);
      setErrorCompras(null);
      return;
    }

    try {
      setLoadingCompras(true);
      setErrorCompras(null);
      
      const response = await devolucionService.obtenerComprasRopaCliente(idCliente);
      
      // Manejar diferentes estructuras de respuesta
      let comprasData = [];
      if (Array.isArray(response)) {
        comprasData = response;
      } else if (response && response.Compras) {
        comprasData = response.Compras;
      } else if (response && response.data) {
        comprasData = response.data.Compras || response.data;
      }
      
      setComprasRopa(comprasData);
      
      if (comprasData.length === 0) {
        setErrorCompras(response.message || 'El cliente no tiene compras de ropa disponibles');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al cargar las compras';
      setErrorCompras(errorMsg);
      showAlert(errorMsg, { type: 'error' });
    } finally {
      setLoadingCompras(false);
    }
  }, []);

  // Efectos secundarios
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    if (formData.Id_Cliente) {
      fetchComprasRopa(formData.Id_Cliente);
    }
  }, [formData.Id_Cliente, fetchComprasRopa]);

  // Validación de campos
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case "Id_Cliente":
        if (!value) newErrors[name] = "Seleccione un cliente";
        else delete newErrors[name];
        break;
      case "Fecha":
        if (!value) newErrors[name] = "Seleccione una fecha";
        else if (new Date(value) > new Date()) newErrors[name] = "Fecha no puede ser futura";
        else delete newErrors[name];
        break;
      case "Motivo":
        if (!value.trim()) {
          newErrors[name] = "Ningun campo sera valido mientras se comience con la tecla espacio";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,!?¿¡()\-]{5,200}$/.test(value)) {
          newErrors[name] = "Motivo inválido (5-200 caracteres, solo letras, números y signos de puntuación)";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const agregarProducto = (detalle) => {
    if (formData.productos.some(p => p.Id_Detalle_Venta === detalle.Id_Detalle_Venta)) {
      showAlert("Este producto ya fue agregado", { type: "warning" });
      return;
    }
    
    // Buscar el precio en diferentes posibles propiedades
    const precio = 
      parseFloat(detalle.Precio) || 
      parseFloat(detalle.precio) || 
      parseFloat(detalle.PrecioUnitario) || 
      parseFloat(detalle.precioUnitario) ||
      0;
    
    // Si todavía es 0, usar el Subtotal del detalle dividido por la cantidad
    let precioFinal = precio;
    if (precioFinal === 0 && detalle.Subtotal && detalle.Cantidad) {
      precioFinal = parseFloat(detalle.Subtotal) / parseInt(detalle.Cantidad);
    }

    // Asegurarnos de que todos los campos tengan valores válidos
    const nuevoProducto = {
      Id_Detalle_Venta: parseInt(detalle.Id_Detalle_Venta) || 0,
      Id_Productos: parseInt(detalle.Id_Productos) || 0,
      Id_Producto_Tallas: detalle.Id_Producto_Tallas ? parseInt(detalle.Id_Producto_Tallas) : null,
      Cantidad: 1,
      MaxCantidad: parseInt(detalle.Disponible) || 0,
      PrecioUnitario: precioFinal,
      Nombre: detalle.Producto?.Nombre || detalle.Producto?.nombre || "Producto sin nombre",
      Talla: detalle.Talla || "Única",
      Subtotal: precioFinal * 1
    };

    // Validación simplificada - Si el subtotal es 0, usar un valor mínimo
    if (nuevoProducto.Subtotal === 0) {
      nuevoProducto.Subtotal = 1;
      nuevoProducto.PrecioUnitario = 1;
    }

    const camposInvalidos = [];
    
    if (!nuevoProducto.Id_Detalle_Venta || nuevoProducto.Id_Detalle_Venta <= 0) {
      camposInvalidos.push('Id_Detalle_Venta');
    }
    
    if (!nuevoProducto.Id_Productos || nuevoProducto.Id_Productos <= 0) {
      camposInvalidos.push('Id_Productos');
    }
    
    if (!nuevoProducto.Cantidad || nuevoProducto.Cantidad <= 0) {
      camposInvalidos.push('Cantidad');
    }
    
    if (!nuevoProducto.Subtotal || nuevoProducto.Subtotal <= 0) {
      camposInvalidos.push('Subtotal');
    }

    if (camposInvalidos.length > 0) {
      const mensajeError = `Campos inválidos: ${camposInvalidos.join(', ')}`;
      showAlert(`Error: ${mensajeError}`, { type: "error" });
      return;
    }

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto]
    }));
  };

  const actualizarCantidad = (index, cantidad) => {
    const nuevosProductos = [...formData.productos];
    const producto = nuevosProductos[index];
    
    cantidad = Math.min(Math.max(1, cantidad), producto.MaxCantidad);
    
    nuevosProductos[index] = {
      ...producto,
      Cantidad: cantidad,
      Subtotal: cantidad * producto.PrecioUnitario
    };

    setFormData(prev => ({ ...prev, productos: nuevosProductos }));
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = [...formData.productos];
    nuevosProductos.splice(index, 1);
    setFormData(prev => ({ ...prev, productos: nuevosProductos }));
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validaciones
    validateField("Id_Cliente", formData.Id_Cliente);
    validateField("Fecha", formData.Fecha);
    validateField("Motivo", formData.Motivo);

    if (formData.productos.length === 0) {
      showAlert("Debe agregar al menos un producto", { type: "error" });
      setSubmitting(false);
      return;
    }

    if (Object.keys(errors).length > 0) {
      showAlert("Corrija los errores en el formulario", { type: "error" });
      setSubmitting(false);
      return;
    }

    try {
      // Preparar datos para enviar - Asegurar tipos correctos
      const productosParaEnviar = formData.productos.map(p => ({
        Id_Detalle_Venta: parseInt(p.Id_Detalle_Venta),
        Id_Productos: parseInt(p.Id_Productos),
        Id_Producto_Tallas: p.Id_Producto_Tallas !== null && !isNaN(parseInt(p.Id_Producto_Tallas)) 
          ? parseInt(p.Id_Producto_Tallas) 
          : null,
        Cantidad: parseInt(p.Cantidad),
        Subtotal: parseFloat(p.Subtotal)
      }));

      // Verificación final de integridad de datos
      const productosInvalidos = productosParaEnviar.filter(p => 
        isNaN(p.Id_Detalle_Venta) || 
        isNaN(p.Id_Productos) || 
        isNaN(p.Cantidad) || 
        isNaN(p.Subtotal) ||
        p.Id_Detalle_Venta <= 0 ||
        p.Id_Productos <= 0 ||
        p.Cantidad <= 0 ||
        p.Subtotal <= 0 ||
        p.Id_Producto_Tallas === undefined
      );

      if (productosInvalidos.length > 0) {
        showAlert(`Hay ${productosInvalidos.length} productos con datos inválidos. Por favor, verifique.`, { type: "error" });
        setSubmitting(false);
        return;
      }

      const datosEnviar = {
        Id_Cliente: parseInt(formData.Id_Cliente),
        Fecha: formData.Fecha,
        Motivo: formData.Motivo.trim(),
        productos: productosParaEnviar
      };

      const response = await devolucionService.crearDevolucion(datosEnviar);
      
      showAlert(response.message || "Devolución registrada exitosamente", { 
        type: "success" 
      });
      navigate("/admin/devoluciones");
      
    } catch (error) {      
      // Manejo de errores mejorado
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const errorMessages = Array.isArray(backendErrors) ? backendErrors : [backendErrors];
        
        showAlert(
          `Errores en los productos: ${errorMessages.join(', ')}`,
          { type: "error" }
        );
      } else if (error.response?.data?.message) {
        showAlert(error.response.data.message, { type: "error" });
      } else {
        const errorMsg = error.message || "Error al registrar devolución";
        showAlert(errorMsg, { type: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    showAlert("Si cancelas, perderás los datos ingresados.", {
      title: "¿Estás seguro?",
      type: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Continuar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/devoluciones");
      }
    });
  };

  // Validación general del formulario
  const isFormValid = () => {
    return formData.Id_Cliente && 
           formData.Fecha && 
           formData.Motivo.trim() && 
           /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,!?¿¡()\-]{5,200}$/.test(formData.Motivo) &&
           formData.productos.length > 0 && 
           Object.keys(errors).length === 0;
  };

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Registrar Devolución
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10"
      >
        {/* Selector de Cliente */}
        <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-3 text-black">
            Cliente <span className="text-red-500">*</span>
          </h3>
          {loadingClientes ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
          ) : (
            <>
              <Select
                placeholder="Seleccione un cliente"
                isClearable
                options={clientes.map(cliente => ({
                  value: cliente.Id_Cliente,
                  label: `${cliente.Nombre} - ${cliente.Documento}`
                }))}
                value={
                  formData.Id_Cliente
                    ? {
                        value: formData.Id_Cliente,
                        label: clientes.find(c => c.Id_Cliente == formData.Id_Cliente)?.Nombre || ""
                      }
                    : null
                }
                onChange={(opcion) => {
                  setFormData(prev => ({
                    ...prev,
                    Id_Cliente: opcion ? opcion.value : ""
                  }));
                  validateField("Id_Cliente", opcion ? opcion.value : "");
                }}
              />
              {errors.Id_Cliente && (
                <p className="text-red-500 text-sm mt-1">{errors.Id_Cliente}</p>
              )}
            </>
          )}
        </div>

        {/* Fecha actual */}
        <div className="p-6 bg-white shadow border border-gray-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-3 text-black">
            Fecha de devolución <span className="text-red-500">*</span>
          </h3>
          <input
            type="date"
            name="Fecha"
            value={formData.Fecha}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className={`w-full border p-2 rounded ${errors.Fecha ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {errors.Fecha && (
            <p className="text-red-500 text-sm mt-1">{errors.Fecha}</p>
          )}
        </div>

        <div className="p-6 bg-white shadow border border-gray-200 rounded-lg md:col-span-2">
          <h3 className="text-2xl font-bold mb-3 text-black">
            Motivo <span className="text-red-500">*</span>
          </h3>
          <textarea
            name="Motivo"
            value={formData.Motivo}
            onChange={handleChange}
            rows={3}
            maxLength={200}
            className={`w-full p-2 border rounded ${errors.Motivo ? "border-red-500" : "border-gray-300"}`}
            placeholder="Describa el motivo de la devolución..."
            required
          />
          <div className="flex justify-between mt-1">
            {errors.Motivo && (
              <span className="text-red-500 text-sm">{errors.Motivo}</span>
            )}
            <span className="text-gray-500 text-sm ml-auto">
              {formData.Motivo.length}/200 caracteres
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow border border-gray-200 md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4">Compras de Ropa del Cliente</h2>
          
          {errorCompras && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorCompras}</span>
              </div>
            </div>
          )}
          
          {loadingCompras ? (
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          ) : comprasRopa.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {formData.Id_Cliente 
                ? "El cliente no tiene compras de ropa registradas"
                : "Seleccione un cliente para ver sus compras"}
            </div>
          ) : (
            <div className="space-y-4">
              {comprasRopa.map(compra => (
                <div key={compra.Id_Venta} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg">Compras Realizadas</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(compra.Fecha).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {compra.Detalles.map(detalle => (
                      <div key={detalle.Id_Detalle_Venta} className="flex justify-between items-center p-3 border-b">
                        <div>
                          <p className="font-medium">{detalle.Producto?.Nombre}</p>
                          <p className="text-sm text-gray-500">
                            {detalle.Talla && `Talla: ${detalle.Talla} • `}
                            Disponible: {detalle.Disponible}/{detalle.Cantidad}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => agregarProducto(detalle)}
                          className="blue"
                          icon="fa-plus"
                          disabled={detalle.Disponible <= 0}
                        >
                          {detalle.Disponible <= 0 ? "No disponible" : "Agregar"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {formData.productos.length > 0 && (
          <div className="bg-white p-6 rounded shadow border border-gray-200 md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Productos a Devolver</h2>
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-left">Talla</th>
                    <th className="p-2 text-right">Precio Unitario</th>
                    <th className="p-2 text-right">Cantidad</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.productos.map((producto, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{producto.Nombre}</td>
                      <td className="p-2">{producto.Talla}</td>
                      <td className="p-2 text-right">
                        ${producto.PrecioUnitario.toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="1"
                          max={producto.MaxCantidad}
                          value={producto.Cantidad}
                          onChange={(e) => actualizarCantidad(index, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-right shadow-sm transition-all"
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Máx: {producto.MaxCantidad}
                        </p>
                      </td>
                      <td className="p-2 text-right">
                        ${producto.Subtotal.toLocaleString("es-CO", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center">
                          <Button
                            onClick={() => eliminarProducto(index)}
                            className="red"
                            icon="fa-trash"
                          >
                            <div className="flex items-center gap-2">
                              Eliminar
                            </div>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan="3" className="p-2 text-right">
                      Total:
                    </td>
                    <td className="p-2 text-right">
                      {formData.productos.reduce((sum, p) => sum + p.Cantidad, 0)}
                    </td>
                    <td className="p-2 text-right">
                      $
                      {formData.productos.reduce((sum, p) => sum + p.Subtotal, 0).toLocaleString("es-CO", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
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
            disabled={!isFormValid() || submitting}
          >
            <div className="flex items-center gap-2">
              {submitting ? "Guardando..." : "Guardar"}
            </div>
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

export default AgregarDevolucion;