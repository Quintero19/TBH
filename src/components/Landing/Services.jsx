// src/components/Landing/Services.jsx
import React, { useState, useEffect } from 'react';
import { publicCatProductoService } from '../../service/publicCatProducto.service';
import '../../styles/css/PublicCategories.css';

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await publicCatProductoService.obtenerCategoriasActivas();
        setCategories(response.data);
      } catch (err) {
        setError('Error al cargar las categorías');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="categories-loading">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="categories-error">{error}</div>;
  }

  return (
    <section id="services" className="public-categories">
      <h2>Nuestras Categorías de Productos</h2>
      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.Id_Categoria_Producto} className="category-card">
            <h3>{category.Nombre}</h3>
            <p>{category.Descripcion}</p>
            <div className="category-meta">
              <span className={`tag ${category.Es_Ropa ? 'clothing' : 'non-clothing'}`}>
                {category.Es_Ropa ? 'Ropa' : 'Accesorio'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Exportación por defecto (correcta para la importación actual)
export default Services;