import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../../components/Buttons/Button";
import { servicioService } from "../../../../service/serviciosService";

const EditarServicios = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    Nombre: "",
    Precio: "",
    Duracion: "",
    Descripcion: "",
  });

  useEffect(() => {
    const cargarServicio = async () => {
      try {
        const servicioData = await servicioService.obtenerServicioPorId(id);

        if (!servicioData || typeof servicioData !== "object") {
          throw new Error("Formato de datos inválido");
        }

        setFormData({
          Nombre: servicioData.Nombre || "",
          Precio: servicioData.Precio || "",
          Duracion: servicioData.Duracion || "",
          Descripcion: servicioData.Descripcion || "",
        });
      } catch (error) {
        console.error("Error al cargar servicio:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar el servicio",
          icon: "error",
          background: "#000",
          color: "#fff",
        });
        navigate("/admin/servicios");
      }
    };

    cargarServicio();
  }, [id, navigate]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
			case "Nombre": {
		const regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

		if (value.trim().length === 0) {
			newErrors[name] = "El nombre es requerido";
		} else if (!regex.test(value)) {
			newErrors[name] = "No se permiten números ni caracteres especiales";
		} else if (value.trim().length < 3) {
			newErrors[name] = "Debe tener al menos 3 caracteres";
		} else if (value.trim().length > 30) {
			newErrors[name] = "No puede exceder los 30 caracteres";
		} else {
			delete newErrors[name];
		}
		break;
	}


			case "Precio":
				if (value.trim().length === 0) {
					newErrors[name] = "El precio es requerido";
				} else if (/[eE]/.test(value)) {
					newErrors[name] = "No se permite la notación científica (e)";
				} else if (Number.isNaN(Number(value)) || Number(value) <= 0) {
					newErrors[name] = "Debe ser un número mayor a 0";
				} else {
					delete newErrors[name];
				}
				break;

			case "Duracion": {
				const isValid =
					/^[0-9]+$/.test(value) &&
					Number.parseInt(value) > 0 &&
					Number.parseInt(value) <= 120;

				if (value.trim().length === 0) {
					newErrors[name] = "La duración es requerida";
				} else if (!isValid) {
					newErrors[name] = "Debe ser un número entero entre 1 y 120 minutos (2 horas)";
				} else {
					delete newErrors[name];
				}
				break;
			}

			case "Descripcion":
				if (value.trim().length === 0) {
					newErrors[name] = "La descripción es requerida";
				} else if (value.length < 5 || value.length > 150) {
					newErrors[name] = "Debe tener al menos 5 caracteres y máximo 150";
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

    if (newErrors[name] === "") {
      delete newErrors[name];
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for numeric fields
    if (name === "Precio" || name === "Duracion") {
      if (value !== "" && Number.isNaN(value)) return;
    }

    const updatedValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    validateField(name, updatedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ["Nombre", "Precio", "Duracion", "Descripcion"];
    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].toString().trim() === ""
    );

    if (missingFields.length > 0 || Object.keys(errors).length > 0) {
      Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos obligatorios y corrija los errores",
        icon: "error",
        timer: 2000,
        background: "#000",
        color: "#fff",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        Precio: Number.parseFloat(formData.Precio),
        Duracion: Number.parseInt(formData.Duracion),
      };

      await servicioService.actualizarServicio(id, payload);
      Swal.fire({
        title: "¡Éxito!",
        text: "El servicio ha sido actualizado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "#000",
        color: "#fff",
      }).then(() => {
        navigate("/admin/servicios");
      });
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el servicio.",
        icon: "error",
        background: "#000",
        color: "#fff",
      });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Si cancelas, perderás los cambios realizados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, continuar",
      background: "#000",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/admin/servicios");
      }
    });
  };

  return (
    <>
      <h1 className="text-5xl ml-10 font-bold mb-5 text-black">
        Editar Servicio
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Nombre <span className="text-red-500">*</span>
          </h3>
          <input
            type="text"
            name="Nombre"
            value={formData.Nombre}
            onChange={handleChange}
            maxLength={50}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.Nombre && (
            <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
					<h3 className="text-2xl text-black font-bold mb-2">
						Precio <span className="text-red-500">*</span>
					</h3>
					<input
						type="number"
						step="0.01"
						min="0"
						name="Precio"
						value={formData.Precio}
						onChange={(e) => {
							const value = e.target.value;
							const digitsOnly = value.replace(".", "");
							if (digitsOnly.length <= 6) {
								handleChange(e);
							}
						}}
						onKeyDown={(e) => {
							const allowedKeys = [
								"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
								".", "Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight"
							];
							if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
								e.preventDefault();
							}
							if (e.key === "." && e.target.value.includes(".")) {
								e.preventDefault();
							}
						}}
						required
						className="w-full p-2 border border-gray-300 rounded"
					/>
					{errors.Precio && (
						<p className="text-red-500 text-sm mt-1">{errors.Precio}</p>
					)}
				</div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Duración (min) <span className="text-red-500">*</span>
          </h3>
          <input
            type="number"
            name="Duracion"
            value={formData.Duracion}
            onChange={handleChange}
            min="1"
            max="120"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.Duracion && (
            <p className="text-red-500 text-sm mt-1">{errors.Duracion}</p>
          )}
        </div>

        <div className="p-7 bg-white shadow border-2 border-gray-200 rounded-lg m-7 mt-2">
          <h3 className="text-2xl text-black font-bold mb-2">
            Descripción <span className="text-red-500">*</span>
          </h3>
          <textarea
            name="Descripcion"
            value={formData.Descripcion}
            onChange={handleChange}
            maxLength={120}
            required
            className="w-full p-2 border border-gray-300 rounded"
            rows={3}
          />
          {errors.Descripcion && (
            <p className="text-red-500 text-sm mt-1">{errors.Descripcion}</p>
          )}
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

          <Button
            type="button"
            className="red"
            onClick={handleCancel}
            icon="fa-times"
          >
            <div className="flex items-center gap-2">Cancelar</div>
          </Button>
        </div>
      </form>
    </>
  );
};

export default EditarServicios;