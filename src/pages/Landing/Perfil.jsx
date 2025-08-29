import { useState, useEffect } from "react";
import { getCurrentUser } from "../../service/authService";
import { clienteService } from "@/service/clientes.service";
import { showAlert } from "@/components/AlertProvider";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [formData, setFormData] = useState({
    Tipo_Documento: "",
    Nombre: "",
    Celular: "",
    Direccion: "",
    Correo: "",
    F_Nacimiento: "",
    Sexo: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser(); 
      setUser(u);

      if (u?.documento) {
        try {
          const cliente = await clienteService.listarClientePorDocumento(u.documento);
          setCliente(cliente)
          if (cliente?.data) {
            setFormData({
              Tipo_Documento: cliente.data.Tipo_Documento,
              Nombre: cliente.data.Nombre,
              Celular: cliente.data.Celular,
              Direccion: cliente.data.Direccion,
              Correo: u.correo,
              F_Nacimiento: cliente.data.F_Nacimiento?.slice(0, 10) || "",
              Sexo: cliente.data.Sexo,
            });
          }
        } catch (err) {
          console.error("Error cargando perfil", err);
        }
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clienteService.actualizarCliente(cliente.data.Id_Cliente, formData);
      showAlert("Éxito Perfil actualizado correctamente", {
                    type: "success",
                    duration: 1500,
                })
    } catch (error) {
      showAlert("Error", error.message || "No se pudo actualizar", { type: "error" });
    } finally {
      setLoading(false);
    }
  };


  return (
  <>
      <a href="/"><FontAwesomeIcon icon={faArrowLeft} style={{ color: "#000000ff",fontSize: "20px", margin:"20px" }} /></a>
    <div className="perfil-container">
        
     <b> <h2>Mi Perfil</h2></b>
     <br />
      <form onSubmit={handleSubmit} className="perfil-form">
        <label>
          Nombre:
          <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} />
        </label>
        <label>
            Tipo de documento
            <select
            name="TipoDocumento"
            value={formData.Tipo_Documento}
            onChange={handleChange}
            
          >
            <option value="">Seleccione tipo documento</option>
            <option value="C.C">Cédula</option>
            <option value="T.I">Tarjeta de Identidad</option>
            <option value="C.E">Cédula de Extranjería</option>
          </select>
        </label>
        <label>
          Celular:
          <input type="text" name="Celular" value={formData.Celular} onChange={handleChange} />
        </label>
        <label>
          Dirección:
          <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} />
        </label>
        <label>
          Correo:
          <input type="text" name="Direccion" value={formData.Correo} onChange={handleChange} />
        </label>
        <label>
          Fecha de Nacimiento:
          <input type="date" name="F_Nacimiento" value={formData.F_Nacimiento} onChange={handleChange} />
        </label>
        <label>
          Sexo:
          <select name="Sexo" value={formData.Sexo} onChange={handleChange}>
            <option value="">Seleccione</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  </>
  );
};

export default Perfil;
