import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/service/authService";
import AgendarModal from "@/components/Landing/AgendarModal";
import "@/styles/css/PublicCategories.css";

const ServiceCard = ({ servicio }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [cliente, setCliente] = useState(null);

  const handleAgendar = async () => {
    const user = await getCurrentUser();

    if (!user) {
      navigate("/login");
      return;
    }

    console.log("🔍 Usuario obtenido en ServiceCard:", user);
    setCliente(user); // 👈 cliente autenticado
    setShowModal(true);
  };

  return (
    <>
      <div className="category-card gold-shine">
        <h3>{servicio.Nombre}</h3>
        {servicio.Imagenes && servicio.Imagenes.length > 0 && (
          <img
            src={servicio.Imagenes[0].URL}
            alt={servicio.Nombre}
            className="product-thumbnail"
          />
        )}


        <p>{servicio.Descripcion}</p>

        <div className="product-details">
          <div className="product-price">
            ${parseFloat(servicio.Precio).toLocaleString("es-CO")}
          </div>
          <div className="product-stock">
            {servicio.Estado ? "Disponible" : "No disponible"}
          </div>
          <div className="product-category">
            Duración: {servicio.Duracion} min
          </div>
        </div>

        <button className="view-products-btn" onClick={handleAgendar}>
          Agendar
        </button>
      </div>

      {showModal && (
        <AgendarModal cliente={cliente} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default ServiceCard;
