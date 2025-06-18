import { showAlert } from "@/components/AlertProvider";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/components/Buttons/Button";
import { empleadoService } from "@/service/empleado.service";

const EditarEmpleado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    Id_Empleados: "",
    Tipo_Documento: "",
    Documento: "",
    Nombre: "",
    Celular: "",
    F_Nacimiento: "",
    Direccion: "",
    Sexo: "",
    Estado: true,
  });

  useEffect(() => {
    const cargarEmpleado = async () => {
      try {
        const response = await empleadoService.obtenerEmpleadoPorId(id);
        const empleado = response.data;
        
        if (empleado.F_Nacimiento) {
          empleado.F_Nacimiento = empleado.F_Nacimiento.split('T')[0];
        }

        setFormData(empleado);
      } catch (error) {
        console.error("Error al cargar empleado:", error);
        showAlert("No se pudo cargar el empleado", {
          type: "error",
          title: "Error"
        });
        navigate("/admin/empleado");
      } finally {
        setLoading(false);
      }
    };

    cargarEmpleado();
  }, [id, navigate]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "Nombre":
        if (!value.trim()) {
          newErrors[name] = "Ningun campo sera valido mientras se comience con la tecla espacio";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(value)) {
          newErrors[name] = "Nombre inválido (3-50 letras)";
        } else {
          delete newErrors[name];
        }
        break;

      case "Documento":
        if (!value.trim()) {
          newErrors[name] = "Requerido";
        } else if (!/^\d{8,12}$/.test(value)) {
          newErrors[name] = "Documento inválido (8-12 dígitos)";
        } else {
          delete newErrors[name];
        }
        break;

      case "Celular":
        if (!value.trim()) {
          newErrors[name] = "Requerido";
        } else if (!/^\d{10,11}$/.test(value)) {
          newErrors[name] = "Celular inválido (10-11 dígitos)";
        } else {
          delete newErrors[name];
        }
        break;

      case "F_Nacimiento":
        if (!value) {
          newErrors[name] = "Requerido";
        } else {
          const fecha = new Date(value);
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 100);
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() - 18);

          if (fecha < minDate || fecha > maxDate) {
            newErrors[name] = "Edad debe ser 18-100 años";
          } else {
            delete newErrors[name];
          }
        }
        break;

      case "Tipo_Documento":
      case "Sexo":
        if (!value) {
          newErrors[name] = "Requerido";
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
    const val = type === "checkbox" ? checked : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validar todos los campos
    Object.keys(formData).forEach(field => {
      if (field !== "Direccion" && field !== "Id_Empleados") {
        validateField(field, formData[field]);
      }
    });

    if (Object.keys(errors).length > 0) {
      showAlert("Corrija los errores en el formulario", {
        type: "error",
        title: "Error de validación"
      });
      setSubmitting(false);
      return;
    }

    try {
      await empleadoService.actualizarEmpleado(id, formData);
      showAlert("Empleado actualizado exitosamente", {
        type: "success",
        title: "Éxito"
      });
      navigate("/admin/empleado");
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      const msg = error.response?.data?.message || "Error al actualizar empleado";
      showAlert(msg, { 
        type: "error", 
        title: "Error",
        duration: 3000
      });
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
				navigate("/admin/empleado");
			}
		});
	};
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Editar Empleado
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo Documento */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Tipo de Documento <span className="text-red-500">*</span>
          </h3>
          <select
            name="Tipo_Documento"
            value={formData.Tipo_Documento}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.Tipo_Documento ? "border-red-500" : "border-gray-300"} rounded`}
            required
          >
            <option value="">Seleccione...</option>
            <option value="C.C">Cédula de Ciudadanía</option>
            <option value="C.E">Cédula de Extranjería</option>
          </select>
          {errors.Tipo_Documento && (
            <p className="text-red-500 text-sm mt-1">{errors.Tipo_Documento}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Documento <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Documento"
            value={formData.Documento}
            readOnly
            className={`w-full p-2 border bg-gray-100 text-gray-600 cursor-not-allowed ${
              errors.Documento ? "border-red-500" : "border-gray-300"
            } rounded`}
            required
          />
          {errors.Documento && (
            <p className="text-red-500 text-sm mt-1">{errors.Documento}</p>
          )}
        </div>


        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Nombre Completo <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Nombre"
            value={formData.Nombre}
            onChange={handleChange}
            maxLength={50}
            className={`w-full p-2 border ${errors.Nombre ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
          )}
        </div>

        {/* Celular */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Celular <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Celular"
            value={formData.Celular}
            onChange={handleChange}
            maxLength={11}
            className={`w-full p-2 border ${errors.Celular ? "border-red-500" : "border-gray-300"} rounded`}
            required
          />
          {errors.Celular && (
            <p className="text-red-500 text-sm mt-1">{errors.Celular}</p>
          )}
        </div>

        {/* Fecha Nacimiento */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Fecha Nacimiento <span className="text-red-500">*</span>
          </h3>
          <input
            type="date"
            name="F_Nacimiento"
            value={formData.F_Nacimiento}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.F_Nacimiento ? "border-red-500" : "border-gray-300"} rounded`}
            max={new Date().toISOString().split("T")[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
            required
          />
          {errors.F_Nacimiento && (
            <p className="text-red-500 text-sm mt-1">{errors.F_Nacimiento}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">Dirección</h3>
          <input
            type="text"
            name="Direccion"
            value={formData.Direccion}
            onChange={handleChange}
            maxLength={100}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Sexo */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Sexo <span className="text-red-500">*</span>
          </h3>
          <select
            name="Sexo"
            value={formData.Sexo}
            onChange={handleChange}
            className={`w-full p-2 border ${errors.Sexo ? "border-red-500" : "border-gray-300"} rounded`}
            required
          >
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {errors.Sexo && (
            <p className="text-red-500 text-sm mt-1">{errors.Sexo}</p>
          )}
        </div>

        {/* Estado */}
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">Estado</h3>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="Estado"
              checked={formData.Estado}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 rounded"
            />
            <label className="text-gray-700">Activo</label>
          </div>
        </div>

        <div className="md:col-span-2 flex gap-2 ml-7">
          <Button
            type="button"
            onClick={handleCancel}
            className="red"
            disabled={submitting}
            icon="fa-times"
          >
            <div className="flex items-center gap-2">Cancelar</div>
          </Button>
          <Button
            type="submit"
            className="green"
            disabled={submitting || Object.keys(errors).length > 0}
            loading={submitting}
            icon="fa-floppy-o"
          >
            <div className="flex items-center gap-2">Guardar</div>
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditarEmpleado;