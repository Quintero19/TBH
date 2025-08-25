# 📋 Documentación del Controlador de Ventas

## 🎯 **Funcionalidades Actuales y Requeridas**

### **1. Crear Venta (`POST /ventas`)**

#### **Funcionalidad Actual:**
- ✅ Recibe datos de venta con productos/servicios
- ✅ Guarda información básica (cliente, empleado, fecha, método de pago)
- ✅ Procesa detalles de venta con precios y cantidades
- ✅ Guarda referencia para transferencias

#### **Funcionalidad Requerida (Mejorada):**
```javascript
// Estructura de datos que debe recibir y procesar:
{
  "Id_Cliente": 1,
  "Id_Empleados": 13,
  "Fecha": "2025-08-25",
  "M_Pago": "Efectivo",
  "Referencia": null,
  "Detalle_Venta": [
    {
      "Id_Productos": 14,
      "Id_Servicio": null,
      "Cantidad": 4,
      "Precio": 72000,
      "Subtotal": 288000,
      "Id_Producto_Tallas": null,
      "Id_Producto_Tamano_Insumos": 2,
      "Tallas": [], // Array de tallas seleccionadas
      "Tamanos": [  // Array completo de tamaños seleccionados
        {
          "index": 0,
          "nombre": "Pequeño",
          "Cantidad": 2,
          "PrecioTamano": 1000,
          "PrecioTotal": 1000
        },
        {
          "index": 1,
          "nombre": "Grande", 
          "Cantidad": 2,
          "PrecioTamano": 35000,
          "PrecioTotal": 35000
        }
      ]
    }
  ]
}
```

#### **Validaciones Requeridas:**
- ✅ Validar que el cliente existe
- ✅ Validar que el empleado existe
- ✅ Validar que hay al menos un item en la venta
- ✅ Validar método de pago válido
- ✅ Validar referencia si es transferencia
- ✅ Validar stock disponible para productos
- ✅ Validar que las cantidades de tallas/tamaños coincidan con la cantidad total

### **2. Obtener Ventas (`GET /ventas`)**

#### **Funcionalidad Actual:**
- ✅ Retorna lista de todas las ventas
- ✅ Incluye información básica (ID, empleado, fecha, total, estado)

#### **Funcionalidad Requerida:**
```javascript
// Respuesta esperada:
{
  "status": "success",
  "data": [
    {
      "Id_Ventas": 2039,
      "Id_Cliente": 1,
      "Id_Empleados": 13,
      "Nombre_Empleado": "yruon",
      "Fecha": "2025-08-25",
      "Total": "368000.00",
      "M_Pago": "Efectivo",
      "Estado": 1,
      // ... otros campos
    }
  ]
}
```

### **3. Obtener Venta por ID (`GET /ventas/:id`)**

#### **Funcionalidad Actual:**
- ✅ Retorna detalles completos de una venta específica
- ✅ Incluye información del cliente y empleado
- ✅ Incluye detalles de productos y servicios

#### **Funcionalidad Requerida (Mejorada):**
```javascript
// Respuesta esperada con tallas y tamaños:
{
  "status": "success", 
  "data": {
    "Id_Ventas": 2039,
    "Id_Cliente": 1,
    "Id_Empleados": 13,
    "Nombre_Empleado": "yruon",
    "Fecha": "2025-08-25",
    "Total": "368000.00",
    "M_Pago": "Efectivo",
    "Estado": 1,
    "Detalle_Venta": [
      {
        "Id_Detalle_Venta": 3027,
        "Id_Productos": 14,
        "Cantidad": 4,
        "Precio": "72000.00",
        "Subtotal": "288000.00",
        "Id_Producto_Tallas": null,
        "Id_Producto_Tamano_Insumos": 2,
        "Tallas": [], // Array completo de tallas
        "Tamanos": [  // Array completo de tamaños
          {
            "index": 0,
            "nombre": "Pequeño",
            "Cantidad": 2,
            "PrecioTamano": 1000,
            "PrecioTotal": 1000
          },
          {
            "index": 1,
            "nombre": "Grande",
            "Cantidad": 2, 
            "PrecioTamano": 35000,
            "PrecioTotal": 35000
          }
        ],
        "Id_Productos_Producto": {
          "Id_Productos": 14,
          "Nombre": "La perra de nando color negro",
          "Es_Perfume": true,
          "Es_Ropa": false,
          // ... otros campos del producto
        }
      }
    ]
  }
}
```

### **4. Marcar Venta Completada (`PUT /ventas/:id/completar`)**

#### **Funcionalidad Actual:**
- ✅ Cambia estado de la venta a completada
- ✅ Actualiza fecha de completado

#### **Funcionalidad Requerida:**
```javascript
// Validaciones adicionales:
- ✅ Verificar que la venta existe
- ✅ Verificar que la venta no esté ya completada
- ✅ Actualizar stock de productos vendidos
- ✅ Registrar movimiento de inventario
```

### **5. Anular Venta (`PUT /ventas/:id/anular`)**

#### **Funcionalidad Actual:**
- ✅ Cambia estado de la venta a anulada
- ✅ Actualiza fecha de anulación

#### **Funcionalidad Requerida:**
```javascript
// Validaciones adicionales:
- ✅ Verificar que la venta existe
- ✅ Verificar que la venta no esté ya anulada
- ✅ Restaurar stock de productos
- ✅ Registrar movimiento de inventario de reversión
```

## 🔧 **Mejoras Críticas Requeridas**

### **1. Manejo de Tallas y Tamaños**

#### **Problema Actual:**
- ❌ Solo guarda el primer ID de talla/tamaño
- ❌ No preserva información completa de múltiples tallas/tamaños
- ❌ Pierde información de cantidades por talla/tamaño

#### **Solución Requerida:**
```javascript
// En lugar de solo guardar:
"Id_Producto_Tamano_Insumos": 2

// Debe guardar también:
"Tamanos": [
  {
    "Id_Producto_Tamano_Insumos": 2,
    "nombre": "Pequeño", 
    "Cantidad": 2,
    "Precio": 1000
  },
  {
    "Id_Producto_Tamano_Insumos": 3,
    "nombre": "Grande",
    "Cantidad": 2, 
    "Precio": 35000
  }
]
```

### **2. Validaciones de Stock**

#### **Funcionalidad Requerida:**
```javascript
// Para productos con tallas:
- ✅ Verificar stock disponible por talla
- ✅ Validar que la suma de cantidades por talla = cantidad total
- ✅ Actualizar stock por talla al completar venta

// Para productos con tamaños:
- ✅ Verificar stock disponible por tamaño
- ✅ Validar que la suma de cantidades por tamaño = cantidad total  
- ✅ Actualizar stock por tamaño al completar venta
```

### **3. Cálculo de Precios**

#### **Funcionalidad Requerida:**
```javascript
// Para productos normales:
- ✅ Usar precio base del producto

// Para productos con tallas:
- ✅ Precio base + precio de talla

// Para productos con tamaños (perfumes):
- ✅ Solo precio del tamaño (sin precio base)
- ✅ Calcular subtotal por tamaño
- ✅ Sumar todos los subtotales
```

### **4. Gestión de Inventario**

#### **Funcionalidad Requerida:**
```javascript
// Al crear venta:
- ✅ Reservar stock temporalmente
- ✅ Validar disponibilidad en tiempo real

// Al completar venta:
- ✅ Reducir stock definitivamente
- ✅ Registrar movimiento de inventario
- ✅ Actualizar stock por talla/tamaño

// Al anular venta:
- ✅ Restaurar stock
- ✅ Registrar movimiento de reversión
- ✅ Actualizar stock por talla/tamaño
```

## 🌐 **Endpoints Requeridos**

### **1. Ventas**
```
POST   /ventas                    - Crear venta
GET    /ventas                    - Obtener todas las ventas
GET    /ventas/:id                - Obtener venta por ID
PUT    /ventas/:id/completar      - Marcar venta como completada
PUT    /ventas/:id/anular         - Anular venta
```

### **2. Validaciones**
```
GET    /ventas/validar-stock      - Validar stock disponible
POST   /ventas/reservar-stock     - Reservar stock temporalmente
```

### **3. Reportes**
```
GET    /ventas/reportes/diario    - Reporte de ventas diarias
GET    /ventas/reportes/mensual   - Reporte de ventas mensuales
GET    /ventas/reportes/productos - Reporte por productos
```

## 🔍 **Casos de Uso Específicos**

### **1. Venta de Ropa con Múltiples Tallas**
```javascript
// Input:
{
  "producto": "Camiseta",
  "cantidad_total": 3,
  "tallas": [
    {"talla": "S", "cantidad": 1},
    {"talla": "M", "cantidad": 2}
  ]
}

// Validación:
- ✅ Stock disponible: S=5, M=3
- ✅ Cantidad total = suma de tallas (1+2=3)
- ✅ Precio = precio_base + precio_talla

// Guardado:
- ✅ Actualizar stock: S=4, M=1
- ✅ Guardar array completo de tallas
```

### **2. Venta de Perfume con Múltiples Tamaños**
```javascript
// Input:
{
  "producto": "Loción",
  "cantidad_total": 4,
  "tamanos": [
    {"tamaño": "Pequeño", "cantidad": 2, "precio": 1000},
    {"tamaño": "Grande", "cantidad": 2, "precio": 35000}
  ]
}

// Validación:
- ✅ Stock disponible por tamaño
- ✅ Cantidad total = suma de tamaños (2+2=4)
- ✅ Precio = solo precio del tamaño

// Guardado:
- ✅ Actualizar stock por tamaño
- ✅ Guardar array completo de tamaños
- ✅ Calcular subtotal: (1000×2) + (35000×2) = 72000
```

## ⚠️ **Consideraciones de Seguridad**

### **1. Validaciones de Entrada**
- ✅ Sanitizar todos los inputs
- ✅ Validar tipos de datos
- ✅ Verificar permisos de usuario
- ✅ Validar límites de cantidades

### **2. Transacciones**
- ✅ Usar transacciones para operaciones críticas
- ✅ Rollback en caso de error
- ✅ Logging de operaciones importantes

### **3. Auditoría**
- ✅ Registrar quién creó/modificó cada venta
- ✅ Mantener historial de cambios
- ✅ Logging de operaciones de stock

## 📈 **Métricas y Monitoreo**

### **1. KPIs a Monitorear**
- ✅ Ventas por día/mes
- ✅ Productos más vendidos
- ✅ Tiempo promedio de completado
- ✅ Tasa de anulación

### **2. Alertas**
- ✅ Stock bajo por producto
- ✅ Ventas anómalas
- ✅ Errores en transacciones
- ✅ Problemas de conectividad

## 🚀 **Prioridades de Implementación**

### **Alta Prioridad (Crítico)**
1. **Manejo correcto de múltiples tallas/tamaños**
2. **Validaciones de stock en tiempo real**
3. **Cálculo correcto de precios por tipo de producto**
4. **Gestión de inventario al completar/anular ventas**

### **Media Prioridad**
1. **Reportes de ventas**
2. **Métricas y KPIs**
3. **Sistema de alertas**
4. **Auditoría completa**

### **Baja Prioridad**
1. **Optimizaciones de rendimiento**
2. **Funcionalidades adicionales**
3. **Integraciones externas**

## 📝 **Notas de Implementación**

### **Problemas Identificados:**
1. **Backend no guarda array completo de tamaños** - Solo guarda el primer ID
2. **Falta validación de stock por talla/tamaño** - No verifica disponibilidad específica
3. **Cálculo de precios incorrecto** - No maneja correctamente productos con variantes
4. **Gestión de inventario incompleta** - No actualiza stock por talla/tamaño

### **Soluciones Propuestas:**
1. **Modificar estructura de datos** para guardar arrays completos
2. **Implementar validaciones de stock** por talla/tamaño
3. **Corregir lógica de precios** según tipo de producto
4. **Completar gestión de inventario** con actualizaciones específicas

---

**Nota:** Esta documentación debe ser implementada de manera incremental, priorizando las funcionalidades críticas como el manejo correcto de tallas y tamaños múltiples.
