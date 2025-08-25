// src/service/ventas.service.js
import api from "../utils/api";

const USER_URL = "/ventas";

export const ventasService = {
	// =====================================================
	// GESTIÓN PRINCIPAL DE VENTAS
	// =====================================================

	// Crear nueva venta con validaciones completas
	crearVenta: async (data) => {
		console.log("Enviando datos al backend:", JSON.stringify(data, null, 2));
		const res = await api.post(USER_URL, data);
		console.log("Respuesta del backend:", res.data);
		return res.data;
	},

	// Obtener todas las ventas con información completa
	obtenerVentas: async () => {
		const res = await api.get(USER_URL);
		return res.data;
	},

	// Obtener una venta específica por ID
	obtenerVentaPorId: async (id) => {
		const res = await api.get(`${USER_URL}/${id}`);
		return res.data;
	},

	// Marcar venta como completada (cambiar estado de 3 a 1)
	marcarVentaCompletada: async (id) => {
		const res = await api.put(`${USER_URL}/${id}/completar`);
		return res.data;
	},

	// Anular venta (cambiar estado de 3 a 2)
	anularVenta: async (id) => {
		const res = await api.put(`${USER_URL}/${id}/anular`);
		return res.data;
	},

	// =====================================================
	// VALIDACIONES AVANZADAS
	// =====================================================

	// Validar stock disponible en tiempo real
	validarStock: async (data) => {
		const res = await api.post(`${USER_URL}/validar-stock`, data);
		return res.data;
	},

	// =====================================================
	// REPORTES Y ANALYTICS
	// =====================================================

	// Reporte de ventas diarias
	obtenerReporteDiario: async (fecha = null) => {
		const params = fecha ? `?fecha=${fecha}` : '';
		const res = await api.get(`${USER_URL}/reportes/diario${params}`);
		return res.data;
	},

	// Reporte de ventas mensuales
	obtenerReporteMensual: async (mes = null, año = null) => {
		let params = '';
		if (mes && año) {
			params = `?mes=${mes}&año=${año}`;
		} else if (mes) {
			params = `?mes=${mes}`;
		} else if (año) {
			params = `?año=${año}`;
		}
		const res = await api.get(`${USER_URL}/reportes/mensual${params}`);
		return res.data;
	},

	// =====================================================
	// MÉTODOS LEGACY (MANTENER COMPATIBILIDAD)
	// =====================================================

	// Cambiar el estado (anular) de una venta (método legacy)
	cambiarEstadoVenta: async (id) => {
		const res = await api.put(`${USER_URL}/estado/${id}`);
		return res.data;
	},

	// =====================================================
	// FUNCIONES AUXILIARES PARA EL FRONTEND
	// =====================================================

	// Procesar datos de venta para mostrar en la interfaz
	procesarDatosVenta: (venta) => {
		if (!venta) return null;

		// Procesar detalles de venta
		if (venta.Detalle_Venta && Array.isArray(venta.Detalle_Venta)) {
			venta.Detalle_Venta = venta.Detalle_Venta.map(detalle => {
				// Parsear datos de tallas si existen
				if (detalle.Tallas_Data) {
					try {
						detalle.Tallas = JSON.parse(detalle.Tallas_Data);
					} catch (error) {
						console.warn('Error parseando Tallas_Data:', error);
						detalle.Tallas = [];
					}
				}

				// Parsear datos de tamaños si existen
				if (detalle.Tamanos_Data) {
					try {
						detalle.Tamanos = JSON.parse(detalle.Tamanos_Data);
					} catch (error) {
						console.warn('Error parseando Tamanos_Data:', error);
						detalle.Tamanos = [];
					}
				}

				return detalle;
			});
		}

		// Validar total
		venta.totalValidado = true;
		if (venta.Detalle_Venta && Array.isArray(venta.Detalle_Venta)) {
			const totalCalculado = venta.Detalle_Venta.reduce((sum, detalle) => {
				return sum + (parseFloat(detalle.Subtotal) || 0);
			}, 0);
			venta.totalValidado = Math.abs(totalCalculado - parseFloat(venta.Total || 0)) < 0.01;
		}

		return venta;
	},

	// Preparar datos para crear venta
	prepararDatosCrearVenta: (formData) => {
		const ventaData = {
			Id_Cliente: formData.Id_Cliente,
			Id_Empleados: formData.Id_Usuario,
			Fecha: formData.Fecha_Registro,
			M_Pago: formData.Metodo_Pago,
			Referencia: formData.Metodo_Pago === "Transferencia" ? formData.DatosTransferencia : null,
			Estado: 3, // Pendiente por defecto
			Detalle_Venta: formData.Items.map((item) => {
				// Asegurar que los precios sean números válidos
				const precio = Number(item.precio) || 0;
				const cantidad = Number(item.cantidad) || 0;
				const subtotal = precio * cantidad;
				
				const detalle = {
					Id_Productos: item.tipo === "producto" ? item.id : null,
					Id_Servicio: item.tipo === "servicio" ? item.id : null,
					Cantidad: cantidad,
					Precio: precio,
					Subtotal: subtotal,
					// Guardar arrays completos de tallas y tamaños como JSON strings
					Tallas_Data: item.tallas && item.tallas.length > 0 ? JSON.stringify(item.tallas) : null,
					Tamanos_Data: item.tamanos && item.tamanos.length > 0 ? JSON.stringify(item.tamanos) : null,
					// Mantener compatibilidad con campos legacy
					Id_Producto_Tallas: item.tallas && item.tallas.length > 0 ? item.tallas[0].Id_Producto_Tallas : null,
					Id_Producto_Tamano_Insumos: item.tamanos && item.tamanos.length > 0 ? item.tamanos[0].index : null,
				};
				
				// Debug: Log para verificar los datos
				console.log("Detalle preparado:", detalle);
				console.log("Precio calculado en frontend:", precio);
				console.log("Subtotal calculado en frontend:", subtotal);
				console.log("Tallas originales:", item.tallas);
				console.log("Tallas_Data:", detalle.Tallas_Data);
				console.log("Tamaños originales:", item.tamanos);
				console.log("Tamanos_Data:", detalle.Tamanos_Data);
				
				return detalle;
			}),
		};

		// Calcular total de la venta
		const totalVenta = ventaData.Detalle_Venta.reduce((total, detalle) => {
			return total + (Number(detalle.Subtotal) || 0);
		}, 0);
		
		ventaData.Total = totalVenta;
		
		console.log("Total de la venta calculado:", totalVenta);
		console.log("Venta completa a enviar:", ventaData);

		return ventaData;
	},

	// Validar datos antes de enviar
	validarDatosVenta: (ventaData) => {
		const errores = [];

		// Validar cliente
		if (!ventaData.Id_Cliente) {
			errores.push("Cliente es requerido");
		}

		// Validar empleado
		if (!ventaData.Id_Empleados) {
			errores.push("Empleado es requerido");
		}

		// Validar método de pago
		const metodosValidos = ["Efectivo", "Tarjeta", "Transferencia", "PSE"];
		if (!metodosValidos.includes(ventaData.M_Pago)) {
			errores.push("Método de pago inválido");
		}

		// Validar referencia para transferencias
		if (ventaData.M_Pago === "Transferencia" && !ventaData.Referencia) {
			errores.push("Referencia es requerida para transferencias");
		}

		// Validar detalles de venta
		if (!ventaData.Detalle_Venta || ventaData.Detalle_Venta.length === 0) {
			errores.push("Debe incluir al menos un producto o servicio");
		}

		// Validar cada detalle
		ventaData.Detalle_Venta?.forEach((detalle, index) => {
			if (!detalle.Id_Productos && !detalle.Id_Servicio) {
				errores.push(`Detalle ${index + 1}: Debe especificar un producto o servicio`);
			}
			if (!detalle.Cantidad || detalle.Cantidad <= 0) {
				errores.push(`Detalle ${index + 1}: Cantidad debe ser mayor a 0`);
			}
		});

		return {
			valido: errores.length === 0,
			errores
		};
	},

	// Obtener descripción del estado
	obtenerDescripcionEstado: (estado) => {
		const estados = {
			1: "Completada",
			2: "Anulada",
			3: "Pendiente"
		};
		return estados[estado] || "Desconocido";
	},

	// Obtener descripción del método de pago
	obtenerDescripcionMetodoPago: (metodo) => {
		const metodos = {
			"Efectivo": "Efectivo",
			"Tarjeta": "Tarjeta",
			"Transferencia": "Transferencia",
			"PSE": "PSE"
		};
		return metodos[metodo] || metodo;
	}
};
