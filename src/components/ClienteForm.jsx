import { useState } from "react";
import { clienteService } from "@/service/clientes.service";

const ClienteForm = ({ documento, onComplete }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    nombre: "",
    direccion: "",
    celular: "",
    fechaNacimiento: "",
    sexo: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await clienteService.crearCliente({ ...formData, documento });
      onComplete(); 
    } catch (err) {
      console.error("Error guardando cliente:", err);
      alert("No se pudo guardar el cliente. Intenta de nuevo.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Completa tus datos</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="tipoDocumento"
            placeholder="Tipo Documento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
          />
          <input
            type="text"
            name="celular"
            placeholder="Celular"
            value={formData.celular}
            onChange={handleChange}
          />
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
          />
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona sexo</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>

          <button type="submit">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;
