// src/components/Landing/Services.jsx
import React, { useState, useEffect } from 'react';
import { publicCatProductoService } from '../../service/publicCatProducto.service';
import '../../styles/css/PublicCategories.css';


const ProductModal = ({ category, products, isOpen, onClose, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Productos en {category?.Nombre}</h2>
        <p className="category-description">{category?.Descripcion}</p>
        
        {loading ? (
          <div className="loading-products">Cargando productos...</div>
        ) : (
          <>
            <div className="products-summary">
              <span>{products?.length || 0} productos encontrados</span>
            </div>
            <div className="products-grid">
              {products && products.length > 0 ? (
                products.map(product => (
                  <div key={product.Id_Productos} className="product-card">
                    {/* Imagen del producto */}
                    {product.Imagenes && product.Imagenes.length > 0 && (
                      <div className="product-images">
                        <img 
                          src={product.Imagenes[0].URL} 
                          alt={product.Nombre}
                          className="product-thumbnail"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.jpg';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Información del producto */}
                    <h3>{product.Nombre}</h3>
                    <p>{product.Descripcion}</p>
                    
                    <div className="product-details">
                      {product.Precio_Venta && (
                        <p className="product-price">${product.Precio_Venta}</p>
                      )}
                      
                      {product.Stock !== undefined && (
                        <p className="product-stock">
                          Stock: {product.Stock} unidades
                        </p>
                      )}
                      
                      {product.Categoria && (
                        <p className="product-category">
                          Categoría: {product.Categoria}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>No hay productos disponibles en esta categoría.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

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

  // Función para obtener productos de una categoría
  const fetchCategoryProducts = async (categoryId) => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      
      // Usamos el nuevo método del servicio
      const response = await publicCatProductoService.obtenerProductosPorCategoria(categoryId);
      // AQUÍ ESTÁ EL CAMBIO IMPORTANTE: response.data ya es el array de productos
      setCategoryProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductsError('Error al cargar los productos');
      setCategoryProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Manejar clic en "Ver Productos"
  const handleViewProducts = async (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
    await fetchCategoryProducts(category.Id_Categoria_Producto);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setCategoryProducts([]);
    setProductsError(null);
  };

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
            <button 
              className="view-products-btn"
              onClick={() => handleViewProducts(category)}
            >
              Ver Productos
            </button>
          </div>
        ))}
      </div>

      {/* Modal/Popup para mostrar productos */}
      <ProductModal 
        category={selectedCategory}
        products={categoryProducts}
        isOpen={modalOpen}
        onClose={closeModal}
        loading={productsLoading}
      />
      
      {productsError && (
        <div className="products-error-message">
          {productsError}
        </div>
      )}
    </section>
  );
};

export default Services;