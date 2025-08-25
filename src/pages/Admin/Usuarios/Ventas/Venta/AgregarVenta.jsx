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
import { productoService } from "@/service/productos.service";
import { servicioService } from "@/service/serviciosService";

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
		Referencia: "",
		Items: [],
	});

	const [errorCliente, setErrorCliente] = useState(false);
	const [errorMetodoPago, setErrorMetodoPago] = useState(false);
	const [errorReferencia, setErrorReferencia] = useState(false);

	// Estado para el formulario de agregar items
	const [tipoItem, setTipoItem] = useState("producto");
	const [itemSeleccionado, setItemSeleccionado] = useState({
		id: "",
		nombre: "",
		precio: 0,
	});
	const [cantidad, setCantidad] = useState(1);
	
	// Estado para manejar tallas de productos de ropa
	const [tallasDisponibles, setTallasDisponibles] = useState([]);
	const [cantidadesPorTalla, setCantidadesPorTalla] = useState({});
	
	// Estado para manejar tamaños de productos tipo loción/perfume
	const [tamanosDisponibles, setTamanosDisponibles] = useState([]);
	const [cantidadesPorTamano, setCantidadesPorTamano] = useState({});
	
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
						const empleado = await empleadoService.listarEmpleadoPorDocumento(
							user.documento,
						);
						nombreUsuario = empleado?.Nombre || "Empleado no encontrado";
					} catch (err) {
						console.warn("Empleado no encontrado:", err);
					}
				} else {
					try {
						const rol = await rolService.obtenerRolPorId(user.rol_id);
						nombreUsuario =
							rol?.Nombre || rol?.data?.Nombre || "Rol desconocido";
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
				const resProductos = await productoService.obtenerProductoss();
				console.log("Respuesta completa del servicio de productos:", resProductos);
				console.log("Productos obtenidos del servicio:", resProductos?.data);
				console.log("¿Es array?:", Array.isArray(resProductos?.data));
				console.log("Cantidad de productos:", resProductos?.data?.length || 0);
				
				if (Array.isArray(resProductos?.data)) {
					// Filtrar solo productos activos
					const productosActivos = resProductos.data.filter(producto => producto.Estado !== false);
					console.log("Productos activos:", productosActivos);
					console.log("Cantidad de productos activos:", productosActivos.length);
					setProductosDisponibles(productosActivos);
				} else {
					console.log("No es un array, intentando con obtenerProductoss...");
					// Intentar con el otro servicio
					const resProductosAlt = await productoService.obtenerProductoss();
					console.log("Respuesta alternativa:", resProductosAlt);
					console.log("Productos alternativos:", resProductosAlt?.data);
					console.log("¿Es array?:", Array.isArray(resProductosAlt?.data));
					console.log("Cantidad de productos alternativos:", resProductosAlt?.data?.length || 0);
					
					if (Array.isArray(resProductosAlt?.data)) {
						setProductosDisponibles(resProductosAlt.data);
					} else {
						setProductosDisponibles([]);
					}
				}

				// Servicios
				const resServicios = await servicioService.obtenerServicios();
				if (Array.isArray(resServicios?.data)) {
					setServiciosDisponibles(resServicios.data);
				} else {
					setServiciosDisponibles([]);
				}

				setFormData((prev) => ({
					...prev,
					Id_Usuario: user?.id || "",
					Fecha_Registro: today,
				}));
			} catch {
				setClientes([]);
				setProductosDisponibles([]);
				setServiciosDisponibles([]);
			}
		};

		fetchData();
	}, []);

	const getOpcionesItems = () => {
		try {
			const items =
				tipoItem === "producto" ? productosDisponibles : serviciosDisponibles;

			console.log("getOpcionesItems - tipoItem:", tipoItem);
			console.log("getOpcionesItems - productosDisponibles:", productosDisponibles);
			console.log("getOpcionesItems - items a procesar:", items);
			console.log("getOpcionesItems - ¿Es array?:", Array.isArray(items));
			console.log("getOpcionesItems - Cantidad:", items?.length || 0);

			if (!Array.isArray(items) || items.length === 0) {
				console.warn(`No hay ${tipoItem === "producto" ? "productos" : "servicios"} disponibles`);
				return [];
			}

			// Debug: mostrar todos los productos y sus categorías
			if (tipoItem === "producto") {
				console.log("Todos los productos disponibles:", items);
				items.forEach(producto => {
					console.log(`Producto: ${producto.Nombre}`);
					console.log(`  - Es_Ropa: ${producto.Es_Ropa}`);
					console.log(`  - Es_Perfume: ${producto.Es_Perfume}`);
					console.log(`  - Categoria:`, producto.Categoria);
					console.log(`  - Id_Categoria_Producto_Categoria_Producto:`, producto.Id_Categoria_Producto_Categoria_Producto);
					console.log(`  - Detalles:`, producto.Detalles);
					console.log("---");
				});
			}

			return items.map((item) => {
				const id =
					tipoItem === "producto"
						? item.Id_Productos || item.id || ""
						: item.Id_Servicios || item.id || "";

				const nombre = item.Nombre || item.nombre || "Sin nombre";
				
				// Determinar si es ropa o perfume por categoría si no está configurado
				let esRopa = item.Es_Ropa || false;
				let esPerfume = item.Es_Perfume || false;
				
				if (!esRopa && !esPerfume && tipoItem === "producto") {
					// Intentar obtener la categoría de diferentes formas posibles
					let categoria = null;
					let nombreCategoria = '';
					let idCategoria = null;
					
					// Buscar en diferentes campos posibles
					if (item.Categoria) {
						categoria = item.Categoria;
					} else if (item.Id_Categoria_Producto_Categoria_Producto) {
						categoria = item.Id_Categoria_Producto_Categoria_Producto;
					} else if (item.Id_Categoria_Producto) {
						categoria = item.Id_Categoria_Producto;
					}
					
					// Extraer nombre e ID de la categoría
					if (categoria) {
						if (typeof categoria === 'string') {
							nombreCategoria = categoria;
						} else if (typeof categoria === 'object') {
							nombreCategoria = categoria.Nombre || categoria.nombre || '';
							idCategoria = categoria.Id_Categoria_Producto || categoria.id || null;
						} else if (typeof categoria === 'number') {
							idCategoria = categoria;
						}
					}
					
					console.log(`Analizando categoría para ${item.Nombre}:`, {
						categoria,
						nombreCategoria,
						idCategoria
					});
					
					// Lógica para determinar si es ropa o perfume basado en categoría
					if (nombreCategoria.toLowerCase().includes('ropa') || 
						nombreCategoria.toLowerCase().includes('vestimenta') ||
						nombreCategoria.toLowerCase().includes('camisa') ||
						nombreCategoria.toLowerCase().includes('pantalón') ||
						nombreCategoria.toLowerCase().includes('vestimenta') ||
						idCategoria === 1) { // Asumiendo que ID 1 es ropa
						esRopa = true;
						console.log(`Producto ${item.Nombre} identificado como ropa por categoría: ${nombreCategoria}`);
					} else if (nombreCategoria.toLowerCase().includes('perfume') || 
							   nombreCategoria.toLowerCase().includes('loción') ||
							   nombreCategoria.toLowerCase().includes('cosmético') ||
							   nombreCategoria.toLowerCase().includes('fragrancia') ||
							   idCategoria === 3) { // Asumiendo que ID 3 es perfumes
						esPerfume = true;
						console.log(`Producto ${item.Nombre} identificado como perfume por categoría: ${nombreCategoria}`);
					}
				}
				
				// Para productos tipo perfume con tamaños, no mostrar precio (depende del tamaño)
				if ((esPerfume || item.Detalles?.tamanos?.length > 0) && item.Detalles?.tamanos?.length > 0) {
					return {
						value: id,
						label: `${nombre} (Selecciona tamaño)`,
						precio: 0, // Sin precio base, solo dependerá del tamaño
						esRopa: esRopa,
						esPerfume: true,
						detalles: item.Detalles || {},
					};
				}
				
				// Para productos normales, buscar precio en diferentes posibles campos
				const precio = item.Precio || item.precio || item.Precio_Venta || item.precio_venta || item.Valor || item.valor || 0;

				return {
					value: id,
					label: `${nombre} - $${precio.toLocaleString("es-CO")}`,
					precio: precio,
					esRopa: esRopa || (item.Detalles?.tallas?.length > 0),
					esPerfume: esPerfume || (item.Detalles?.tamanos?.length > 0),
					detalles: item.Detalles || {},
				};
			});
		} catch {
			return [];
		}
	};

	// Función para cargar tallas cuando se selecciona un producto de ropa
	const cargarTallasProducto = async (productoId) => {
		if (tipoItem !== "producto") {
			setTallasDisponibles([]);
			setCantidadesPorTalla({});
			return;
		}

		const producto = productosDisponibles.find(p => p.Id_Productos === productoId);
		console.log("Producto encontrado para tallas:", producto);
		console.log("Es_Ropa:", producto?.Es_Ropa);
		console.log("Detalles:", producto?.Detalles);
		console.log("Tallas en detalles:", producto?.Detalles?.tallas);
		
		// Determinar si es ropa por categoría si no está configurado
		let esRopa = producto?.Es_Ropa || false;
		if (!esRopa) {
			// Intentar obtener la categoría de diferentes formas posibles
			let categoria = null;
			let nombreCategoria = '';
			let idCategoria = null;
			
			// Buscar en diferentes campos posibles
			if (producto?.Categoria) {
				categoria = producto.Categoria;
			} else if (producto?.Id_Categoria_Producto_Categoria_Producto) {
				categoria = producto.Id_Categoria_Producto_Categoria_Producto;
			} else if (producto?.Id_Categoria_Producto) {
				categoria = producto.Id_Categoria_Producto;
			}
			
			// Extraer nombre e ID de la categoría
			if (categoria) {
				if (typeof categoria === 'string') {
					nombreCategoria = categoria;
				} else if (typeof categoria === 'object') {
					nombreCategoria = categoria.Nombre || categoria.nombre || '';
					idCategoria = categoria.Id_Categoria_Producto || categoria.id || null;
				} else if (typeof categoria === 'number') {
					idCategoria = categoria;
				}
			}
			
			if (nombreCategoria.toLowerCase().includes('ropa') || 
				nombreCategoria.toLowerCase().includes('vestimenta') ||
				nombreCategoria.toLowerCase().includes('camisa') ||
				nombreCategoria.toLowerCase().includes('pantalón') ||
				idCategoria === 1) {
				esRopa = true;
				console.log("Producto identificado como ropa por categoría:", nombreCategoria);
			}
		}
		
		// También verificar si tiene tallas configuradas
		if (!esRopa && producto?.Detalles?.tallas?.length > 0) {
			esRopa = true;
			console.log("Producto identificado como ropa por tener tallas configuradas");
		}
		
		// Si el producto no tiene Es_Ropa configurado, intentar obtenerlo del producto individual
		if (!esRopa) {
			try {
				const productoDetallado = await productoService.obtenerProductoPorId(productoId);
				console.log("Producto detallado:", productoDetallado?.data);
				
				if (productoDetallado?.data?.Es_Ropa && productoDetallado?.data?.Detalles?.tallas) {
					setTallasDisponibles(productoDetallado.data.Detalles.tallas);
					// Inicializar cantidades en 0 para cada talla
					const cantidadesIniciales = {};
					productoDetallado.data.Detalles.tallas.forEach((talla, index) => {
						cantidadesIniciales[index] = 0;
					});
					setCantidadesPorTalla(cantidadesIniciales);
					console.log("Tallas cargadas desde producto detallado:", productoDetallado.data.Detalles.tallas);
					return;
				}
			} catch (error) {
				console.error("Error obteniendo producto detallado:", error);
			}
		}
		
		if (esRopa && producto?.Detalles?.tallas) {
			setTallasDisponibles(producto.Detalles.tallas);
			// Inicializar cantidades en 0 para cada talla
			const cantidadesIniciales = {};
			producto.Detalles.tallas.forEach((talla, index) => {
				cantidadesIniciales[index] = 0;
			});
			setCantidadesPorTalla(cantidadesIniciales);
			console.log("Tallas cargadas:", producto.Detalles.tallas);
		} else {
			setTallasDisponibles([]);
			setCantidadesPorTalla({});
			console.log("No se encontraron tallas para este producto");
		}
	};

	// Función para cargar tamaños cuando se selecciona un producto tipo loción/perfume
	const cargarTamanosProducto = async (productoId) => {
		if (tipoItem !== "producto") {
			setTamanosDisponibles([]);
			setCantidadesPorTamano({});
			return;
		}

		const producto = productosDisponibles.find(p => p.Id_Productos === productoId);
		
		// Determinar si es perfume por categoría si no está configurado
		let esPerfume = producto?.Es_Perfume || false;
		if (!esPerfume) {
			// Intentar obtener la categoría de diferentes formas posibles
			let categoria = null;
			let nombreCategoria = '';
			let idCategoria = null;
			
			// Buscar en diferentes campos posibles
			if (producto?.Categoria) {
				categoria = producto.Categoria;
			} else if (producto?.Id_Categoria_Producto_Categoria_Producto) {
				categoria = producto.Id_Categoria_Producto_Categoria_Producto;
			} else if (producto?.Id_Categoria_Producto) {
				categoria = producto.Id_Categoria_Producto;
			}
			
			// Extraer nombre e ID de la categoría
			if (categoria) {
				if (typeof categoria === 'string') {
					nombreCategoria = categoria;
				} else if (typeof categoria === 'object') {
					nombreCategoria = categoria.Nombre || categoria.nombre || '';
					idCategoria = categoria.Id_Categoria_Producto || categoria.id || null;
				} else if (typeof categoria === 'number') {
					idCategoria = categoria;
				}
			}
			
			if (nombreCategoria.toLowerCase().includes('perfume') || 
				nombreCategoria.toLowerCase().includes('loción') ||
				nombreCategoria.toLowerCase().includes('cosmético') ||
				nombreCategoria.toLowerCase().includes('fragrancia') ||
				idCategoria === 3) {
				esPerfume = true;
				console.log("Producto identificado como perfume por categoría:", nombreCategoria);
			}
		}
		
		// También verificar si tiene tamaños configurados
		if (!esPerfume && producto?.Detalles?.tamanos?.length > 0) {
			esPerfume = true;
			console.log("Producto identificado como perfume por tener tamaños configurados");
		}
		
		// Si el producto no tiene Es_Perfume configurado, intentar obtenerlo del producto individual
		if (!esPerfume) {
			try {
				const productoDetallado = await productoService.obtenerProductoPorId(productoId);
				console.log("Producto detallado para tamaños:", productoDetallado?.data);
				
				if (productoDetallado?.data?.Es_Perfume && productoDetallado?.data?.Detalles?.tamanos) {
					setTamanosDisponibles(productoDetallado.data.Detalles.tamanos);
					// Inicializar cantidades en 0 para cada tamaño
					const cantidadesIniciales = {};
					productoDetallado.data.Detalles.tamanos.forEach((tamano, index) => {
						cantidadesIniciales[index] = 0;
					});
					setCantidadesPorTamano(cantidadesIniciales);
					console.log("Tamaños cargados desde producto detallado:", productoDetallado.data.Detalles.tamanos);
					return;
				}
			} catch (error) {
				console.error("Error obteniendo producto detallado para tamaños:", error);
			}
		}
		
		if (esPerfume && producto?.Detalles?.tamanos) {
			setTamanosDisponibles(producto.Detalles.tamanos);
			// Inicializar cantidades en 0 para cada tamaño
			const cantidadesIniciales = {};
			producto.Detalles.tamanos.forEach((tamano, index) => {
				cantidadesIniciales[index] = 0;
			});
			setCantidadesPorTamano(cantidadesIniciales);
		} else {
			setTamanosDisponibles([]);
			setCantidadesPorTamano({});
		}
	};

	const agregarItem = () => {
		if (!itemSeleccionado.id || cantidad <= 0) return;

		// Si es un producto de ropa, verificar que se hayan seleccionado tallas
		if (tipoItem === "producto" && tallasDisponibles.length > 0) {
			const totalTallas = Object.values(cantidadesPorTalla).reduce((sum, cant) => sum + cant, 0);
			if (totalTallas === 0) {
				showAlert("Debes seleccionar al menos una talla para productos de ropa", {
					type: "warning",
					title: "Falta información",
				});
				return;
			}
			if (totalTallas !== cantidad) {
				showAlert("La suma de cantidades por talla debe coincidir con la cantidad total", {
					type: "warning",
					title: "Cantidades inconsistentes",
				});
				return;
			}
		}

		// Si es un producto tipo loción/perfume, verificar que se hayan seleccionado tamaños
		if (tipoItem === "producto" && tamanosDisponibles.length > 0) {
			const totalTamanos = Object.values(cantidadesPorTamano).reduce((sum, cant) => sum + cant, 0);
			if (totalTamanos === 0) {
				showAlert("Debes seleccionar al menos un tamaño para productos tipo loción/perfume", {
					type: "warning",
					title: "Falta información",
				});
				return;
			}
			if (totalTamanos !== cantidad) {
				showAlert("La suma de cantidades por tamaño debe coincidir con la cantidad total", {
					type: "warning",
					title: "Cantidades inconsistentes",
				});
				return;
			}
		}

		// Calcular precio total si hay tamaños (solo precio del tamaño)
		let precioTotal = itemSeleccionado.precio;
		if (tamanosDisponibles.length > 0) {
			precioTotal = Object.entries(cantidadesPorTamano)
				.filter(([, cant]) => cant > 0)
				.reduce((total, [index, cant]) => {
					const tamano = tamanosDisponibles[parseInt(index)];
					// Solo precio del tamaño (sin precio base)
					const precioPorUnidad = Number(tamano.precio);
					return total + (precioPorUnidad * cant);
				}, 0);
		}

		const nuevoItem = {
			tipo: tipoItem,
			id: itemSeleccionado.id,
			nombre: itemSeleccionado.nombre,
			precio: precioTotal,
			cantidad: cantidad,
			tallas: tallasDisponibles.length > 0 ? Object.entries(cantidadesPorTalla)
				.filter(([, cant]) => cant > 0)
				.map(([index, cant]) => ({
					Id_Producto_Tallas: tallasDisponibles[parseInt(index)].Id_Producto_Tallas,
					Cantidad: cant,
				})) : [],
			tamanos: tamanosDisponibles.length > 0 ? Object.entries(cantidadesPorTamano)
				.filter(([, cant]) => cant > 0)
				.map(([index, cant]) => ({
					index: parseInt(index),
					nombre: tamanosDisponibles[parseInt(index)].nombre,
					Cantidad: cant,
					PrecioTamano: Number(tamanosDisponibles[parseInt(index)].precio),
					PrecioTotal: Number(tamanosDisponibles[parseInt(index)].precio),
				})) : [],
		};

		console.log("Nuevo item a agregar:", nuevoItem);
		console.log("Tallas en el item:", nuevoItem.tallas);
		console.log("Tamaños en el item:", nuevoItem.tamanos);

		setFormData((prev) => ({
			...prev,
			Items: [...prev.Items, nuevoItem],
		}));

		setItemSeleccionado({ id: "", nombre: "", precio: 0 });
		setCantidad(1);
		setTallasDisponibles([]);
		setCantidadesPorTalla({});
		setTamanosDisponibles([]);
		setCantidadesPorTamano({});
	};

	const eliminarItem = (index) => {
		setFormData((prev) => ({
			...prev,
			Items: prev.Items.filter((_, i) => i !== index),
		}));
	};

	const actualizarCantidad = (index, nuevaCantidad) => {
		if (nuevaCantidad <= 0) return;

		setFormData((prev) => {
			const nuevosItems = [...prev.Items];
			nuevosItems[index].cantidad = Number(nuevaCantidad);
			return { ...prev, Items: nuevosItems };
		});
	};

	const actualizarPrecio = (index, nuevoPrecio) => {
		if (nuevoPrecio < 0) return;

		setFormData((prev) => {
			const nuevosItems = [...prev.Items];
			nuevosItems[index].precio = Number(nuevoPrecio);
			return { ...prev, Items: nuevosItems };
		});
	};

	// Función para actualizar cantidad por talla
	const actualizarCantidadTalla = (index, cantidad) => {
		const cantidadNumerica = cantidad === "" ? 0 : Number(cantidad);
		setCantidadesPorTalla(prev => ({
			...prev,
			[index]: cantidadNumerica
		}));
	};

	// Función para actualizar cantidad por tamaño
	const actualizarCantidadTamano = (index, cantidad) => {
		const cantidadNumerica = cantidad === "" ? 0 : Number(cantidad);
		setCantidadesPorTamano(prev => {
			const newCantidades = {
				...prev,
				[index]: cantidadNumerica
			};
			
			// Actualizar la cantidad total automáticamente
			const totalCantidad = Object.values(newCantidades).reduce((sum, cant) => sum + cant, 0);
			setCantidad(totalCantidad);
			
			return newCantidades;
		});
	};

	const calcularTotal = () => {
		return formData.Items.reduce(
			(total, item) => total + item.precio * item.cantidad,
			0,
		);
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

		if (
			formData.Metodo_Pago === "Transferencia" &&
			!formData.DatosTransferencia?.trim()
		) {
			await showAlert(
				"Debes ingresar una referencia para pagos por transferencia",
				{
					type: "warning",
					title: "Falta información",
				},
			);
			return;
		}

		if (formData.Items.length === 0) {
			await showAlert("Debes agregar al menos un producto o servicio", {
				type: "warning",
				title: "Falta información",
			});
			return;
		}

		const hayItemDuplicado = formData.Items.some(
			(item) => item.tipo !== "producto" && item.tipo !== "servicio",
		);

		if (hayItemDuplicado) {
			await showAlert(
				"Cada ítem debe ser solo producto o servicio, no ambos ni indefinido.",
				{
					type: "warning",
					title: "Datos incorrectos",
				},
			);
			return;
		}

		try {
			// Usar las nuevas funciones del servicio mejorado
			const ventaData = ventasService.prepararDatosCrearVenta(formData);
			
			// Validar datos antes de enviar
			const validacion = ventasService.validarDatosVenta(ventaData);
			if (!validacion.valido) {
				await showAlert(`Errores de validación:\n${validacion.errores.join('\n')}`, {
					type: "error",
					title: "Datos inválidos",
				});
				return;
			}

			console.log("VENTA A ENVIAR ===>", JSON.stringify(ventaData, null, 2));

			await ventasService.crearVenta(ventaData);

			await showAlert("Venta registrada exitosamente", {
				type: "success",
				duration: 1500,
			});

			navigate("/admin/ventas");
		} catch (error) {
			const mensaje =
				error.response?.data?.message || "Error al registrar la venta";
			await showAlert(mensaje, {
				title: "Error",
				icon: "error",
			});
		}
	};

	return (
		<>
			<h1 className="text-5xl ml-10 font-bold mb-5 text-black">
				Registrar Venta
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
										label:
											clientes.find((c) => c.Id_Cliente === formData.Id_Cliente)
												?.Nombre || "",
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
						<p className="text-red-500 text-sm mt-1">
							Debes seleccionar un cliente
						</p>
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
								DatosTransferencia:
									metodo === "Transferencia" ? prev.DatosTransferencia : "",
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
					<h3 className="text-2xl font-bold mb-3 text-black">
						Fecha de registro
					</h3>
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
									{ value: "servicio", label: "Servicio" },
								]}
								value={{
									value: tipoItem,
									label: tipoItem === "producto" ? "Producto" : "Servicio",
								}}
								onChange={(opcion) => {
									setTipoItem(opcion.value);
									setItemSeleccionado({ id: "", nombre: "", precio: 0 });
								}}
							/>
						</div>

						{/* Selector de Producto/Servicio */}
						<div className="md:col-span-2">
							<h3 className="text-xl font-bold mb-3 text-black">
								{tipoItem === "producto" ? "Producto" : "Servicio"}{" "}
								<span className="text-red-500">*</span>
							</h3>
							<Select
								placeholder={`Seleccione un ${tipoItem === "producto" ? "producto" : "servicio"}`}
								options={getOpcionesItems()}
								value={
									itemSeleccionado.id
										? {
												value: itemSeleccionado.id,
												label: `${itemSeleccionado.nombre} - $${itemSeleccionado.precio.toLocaleString("es-CO")}`,
											}
										: null
								}
								onChange={(opcion) => {
									if (opcion) {
										setItemSeleccionado({
											id: opcion.value,
											nombre: opcion.label.split(" - ")[0],
											precio: opcion.precio,
										});
										
										// Cargar tallas y tamaños si es un producto
										if (tipoItem === "producto") {
											cargarTallasProducto(opcion.value);
											cargarTamanosProducto(opcion.value);
										}
									} else {
										setItemSeleccionado({ id: "", nombre: "", precio: 0 });
										setTallasDisponibles([]);
										setCantidadesPorTalla({});
										setTamanosDisponibles([]);
										setCantidadesPorTamano({});
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
								className={`w-full border p-2 rounded h-[38px] ${
									tamanosDisponibles.length > 0 ? "bg-gray-100 cursor-not-allowed" : ""
								}`}
								disabled={tamanosDisponibles.length > 0}
								onKeyDown={(e) => {
									if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
								}}
							/>
							{tamanosDisponibles.length > 0 && (
								<p className="text-xs text-gray-500 mt-1">
									La cantidad se calcula automáticamente según los tamaños seleccionados
								</p>
							)}
						</div>


					</div>

					{/* Botón Agregar */}
					<div className="flex justify-end">
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

					{/* Sección de tallas para productos de ropa */}
					{tipoItem === "producto" && tallasDisponibles.length > 0 && (
						<div className="mt-4 p-4 bg-gray-50 rounded-lg border">
							<h3 className="text-lg font-bold mb-3 text-black">Tallas Disponibles</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
								{tallasDisponibles.map((talla, index) => (
									<div key={`${talla.nombre}-${index}`} className="flex flex-col">
										<label className="text-sm font-medium text-gray-700 mb-1">
											Talla {talla.nombre}: {talla.stock || 0} unidades disponibles
										</label>
										<input
											type="number"
											min="0"
											max={talla.stock || 0}
											value={cantidadesPorTalla[index] === 0 ? "" : cantidadesPorTalla[index]}
											onChange={(e) => actualizarCantidadTalla(index, e.target.value)}
											placeholder="0"
											className="w-full border p-2 rounded text-sm h-[38px]"
											onKeyDown={(e) => {
												if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
											}}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Sección de tamaños para productos tipo loción/perfume */}
					{tipoItem === "producto" && tamanosDisponibles.length > 0 && (
						<div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
							<h3 className="text-lg font-bold mb-3 text-black">Tamaños Disponibles</h3>
							<p className="text-sm text-gray-600 mb-3">
								Selecciona la cantidad de cada tamaño que deseas agregar a la venta
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
								{tamanosDisponibles.map((tamano, index) => (
									<div key={`${tamano.nombre}-${index}`} className="bg-white p-3 rounded-lg border border-gray-200">
										<div className="flex flex-col h-full">
											<div className="flex-1">
												<label className="text-sm font-medium text-gray-700 mb-3 block">
													{tamano.nombre}
												</label>
												<br />
												<div className="text-xs text-green-600 mb-3 px-2 py-1 bg-green-50 rounded">
													Precio: ${Number(tamano.precio || 0).toLocaleString("es-CO")}
												</div>
											</div>
											<div className="mt-auto">
												<input
													type="number"
													min="0"
													value={cantidadesPorTamano[index] === 0 ? "" : cantidadesPorTamano[index]}
													onChange={(e) => actualizarCantidadTamano(index, e.target.value)}
													placeholder="0"
													className="w-full border p-2 rounded text-sm h-[38px]"
													onKeyDown={(e) => {
														if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
													}}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="mt-3 text-sm text-gray-600 bg-white p-2 rounded border">
								<strong>Total seleccionado:</strong> {Object.values(cantidadesPorTamano).reduce((sum, cant) => sum + cant, 0)} unidades
							</div>
						</div>
					)}
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
										{(formData.Items.some(item => item.tallas && item.tallas.length > 0) || 
										  formData.Items.some(item => item.tamanos && item.tamanos.length > 0)) && (
											<th className="p-2 text-center">Tallas/Tamaños</th>
										)}
										<th className="p-2 text-right">Subtotal</th>
										<th className="p-2 text-center">Acciones</th>
									</tr>
								</thead>
								<tbody>
									{formData.Items.map((item, index) => (
										<tr key={index} className="border-b">
											<td className="p-2">
												{item.tipo === "producto" ? "Producto" : "Servicio"}
											</td>
											<td className="p-2">{item.nombre}</td>
											<td className="p-2 text-right">
												<input
													type="number"
													min="0"
													step="0.01"
													placeholder="0"
													value={
														item.precio !== 0
															? parseFloat(item.precio).toString()
															: ""
													}
													onChange={(e) =>
														actualizarPrecio(index, e.target.value)
													}
													className="w-36 px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-right shadow-sm transition-all"
													onKeyDown={(e) => {
														if (["e", "E", "+", "-"].includes(e.key))
															e.preventDefault();
													}}
												/>
											</td>

											<td className="p-2 text-right">
												<input
													type="number"
													min="1"
													placeholder="1"
													value={item.cantidad || ""}
													onChange={(e) =>
														actualizarCantidad(index, e.target.value)
													}
													className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-right shadow-sm transition-all"
													onKeyDown={(e) => {
														if (["e", "E", "+", "-"].includes(e.key))
															e.preventDefault();
													}}
												/>
											</td>
											{(formData.Items.some(item => item.tallas && item.tallas.length > 0) || 
											  formData.Items.some(item => item.tamanos && item.tamanos.length > 0)) && (
												<td className="p-2 text-center">
													{item.tallas && item.tallas.length > 0 ? (
														<div className="text-xs">
															{item.tallas.map((talla, i) => {
																// Buscar el nombre de la talla
																const producto = productosDisponibles.find(p => p.Id_Productos === item.id);
																const tallaInfo = producto?.Detalles?.tallas?.find(t => t.Id_Producto_Tallas === talla.Id_Producto_Tallas);
																return (
																	<div key={i}>
																		{tallaInfo?.nombre || `Talla ${talla.Id_Producto_Tallas}`}: {talla.Cantidad}
																	</div>
																);
															})}
														</div>
													) : item.tamanos && item.tamanos.length > 0 ? (
														<div className="text-xs">
															{item.tamanos.map((tamano, i) => {
																return (
																	<div key={i} className="mb-1">
																		<span className="font-medium">{tamano.nombre}</span>
																		<span className="text-gray-600">: {tamano.Cantidad} uds</span>
																		<span className="text-green-600 ml-1">
																			(${Number(tamano.PrecioTotal || 0).toLocaleString("es-CO")})
																		</span>
																	</div>
																);
															})}
														</div>
													) : (
														"-"
													)}
												</td>
											)}
											<td className="p-2 text-right">
												$
												{(item.precio * item.cantidad).toLocaleString("es-CO", {
													minimumFractionDigits: 0,
													maximumFractionDigits: 2,
												})}
											</td>
											<td className="p-2 text-center">
												<div className="flex justify-center">
													<Button
														onClick={() => eliminarItem(index)}
														className="red"
														icon="fa-times"
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
										<td colSpan={(formData.Items.some(item => item.tallas && item.tallas.length > 0) || 
													 formData.Items.some(item => item.tamanos && item.tamanos.length > 0)) ? "5" : "4"} className="p-2 text-right">
											Total:
										</td>
										<td className="p-2 text-right">
											$
											{calcularTotal().toLocaleString("es-CO", {
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
						disabled={
							errorCliente || errorMetodoPago || formData.Items.length === 0
						}
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
