import { useState } from "react";
import { clienteService } from "@/service/clientes.service";
import { showAlert } from "@/components/AlertProvider";


const ClienteForm = ({ documento, correo, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    TipoDocumento: "",
    Nombre: "",
    Celular: "",
    Direccion: "",
    FechaNacimiento: "",
    Sexo: "",
    Estado: true,
    Correo: correo, // viene del usuario
    Documento: documento, // viene como prop
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {Documento,Correo,TipoDocumento,Nombre,Celular,Direccion,FechaNacimiento,Sexo} = formData

    
        if (!Documento.trim()) {
          return showAlert("Debe completar el campo documento.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
      
        if (!Correo.trim()) {
          return showAlert("Debe completar el campo Correo.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
        if (!TipoDocumento.trim()) {
          return showAlert("Debe completar el campo Tipo Documento.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
        if (!Nombre.trim()) {
          return showAlert("Debe completar el campo Nombre.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
      
        if (!Celular.trim()) {
          return showAlert("Debe completar el campo Celular.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
        if (!/^\d{10}$/.test(Celular)) {
                return showAlert(
                  "El número de celular debe tener solo numeros y exactamente 10 dígitos.",
                  { type: "error", title: "Datos inválidos" },
                );
              }

        if (!Direccion.trim()) {
          return showAlert("Debe completar el campo Direccion.", {
            type: "error",
            title: "Datos inválidos",
          });
        }

        if (!FechaNacimiento.trim()) {
          return showAlert("Debe completar el campo Fecha De Nacimiento.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
      
        
        if (!Sexo.trim()) {
          return showAlert("Debe completar el campo Sexo.", {
            type: "error",
            title: "Datos inválidos",
          });
        }
        
        try{
          await clienteService.crearCliente(formData)

            showAlert("La Informacion ha sido guardado correctamente.", {
                  type: "success",
                  duration: 1500,
                })

          if (onComplete) onComplete(formData);
        }catch (err) {
              console.error(err);
              showAlert(`Error al guardar: ${err.message}`, {
                type: "error",
                title: "Error",
              });
            }


  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Registro de Cliente</h2>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="Documento"
            value={formData.Documento}
            readOnly
          />

          <input
            type="email"
            name="Correo"
            value={formData.Correo}
            readOnly
          />

          <select
            name="TipoDocumento"
            value={formData.TipoDocumento}
            onChange={handleChange}
            
          >
            <option value="">Seleccione tipo documento</option>
            <option value="C.C">Cédula</option>
            <option value="T.I">Tarjeta de Identidad</option>
            <option value="C.E">Cédula de Extranjería</option>
          </select>

          <input
            type="text"
            name="Nombre"
            placeholder="Nombre completo"
            value={formData.Nombre}
            onChange={handleChange}
            
          />

          <input
            type="tel"
            name="Celular"
            placeholder="Celular"
            value={formData.Celular}
            onChange={handleChange}
            
          />

          <input
            type="text"
            name="Direccion"
            placeholder="Dirección"
            value={formData.Direccion}
            onChange={handleChange}
          />

          <input
            type="date"
            name="FechaNacimiento"
            value={formData.FechaNacimiento}
            onChange={handleChange}
          />

          <select
            name="Sexo"
            value={formData.Sexo}
            onChange={handleChange}
          >
            <option value="">Seleccione sexo</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>

          <div className="actions">
            <button type="submit" className="btn-save">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
