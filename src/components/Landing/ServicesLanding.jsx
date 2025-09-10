import React, { useEffect, useState } from "react";
import { servicioService } from "@/service/serviciosService"; 
import ServiceCard from "@/components/Landing/ServiceCard";
import "@/styles/css/PublicCategories.css";

const ServicesLanding = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        // 👇 aquí se corrige: la API devuelve {status, data}, tomamos solo data
        const response = await servicioService.obtenerServiciosActivos();
        setServicios(response.data);
        console.log("Servicios cargados:", response.data);
      } catch (err) {
        console.error("Error al cargar los servicios:", err);
        setError("Error al cargar los servicios.");
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  if (loading) {
    return <div className="categories-loading">Cargando servicios...</div>;
  }

  if (error) {
    return <div className="categories-error">{error}</div>;
  }

  return (
    <section className="public-categories" id="portfolio">
      <h2>Servicios</h2>
      <div className="categories-grid">
        {servicios.length > 0 ? (
          servicios.map((servicio) => (
            <ServiceCard key={servicio.Id_Servicios} servicio={servicio} />
          ))
        ) : (
          <div className="no-products">No hay servicios disponibles</div>
        )}
      </div>
    </section>
  );
};

export default ServicesLanding;
