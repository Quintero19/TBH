import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import emailjs from "emailjs-com";
import "../../styles/css/Contact.css";

const Contact = ({ data }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulamos el envío del formulario (reemplazar con EmailJS)
    setTimeout(() => {
      emailjs
        .sendForm(
          "YOUR_SERVICE_ID",
          "YOUR_TEMPLATE_ID",
          e.target,
          "YOUR_PUBLIC_KEY"
        )
        .then(
          (result) => {
            console.log(result.text);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setSubmitStatus("success");
            setIsSubmitting(false);
          },
          (error) => {
            console.log(error.text);
            setSubmitStatus("error");
            setIsSubmitting(false);
          }
        );
    }, 1500);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
      
      <div className="contact-container">
        <div className="contact-header">
          <div className="header-icon">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          <h2>Ponte en Contacto</h2>
          <p>Nos encantaría saber de ti. Envíanos un mensaje y te responderemos lo antes posible.</p>
          <div className="header-decoration">
            <span></span>
            <i className="fas fa-star"></i>
            <span></span>
          </div>
        </div>

        <div className="contact-content">
          <div className="contact-form-wrapper">
            <div className="form-header">
              <h3>Envíanos un Mensaje</h3>
              <p>Completa el formulario y nos pondremos en contacto contigo</p>
            </div>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${activeField === 'name' ? 'active' : ''}`}
                      placeholder=" "
                      required
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      value={formData.name}
                    />
                    <label htmlFor="name" className="form-label">
                      <i className="fas fa-user"></i>
                      Nombre Completo
                    </label>
                    <div className="input-border"></div>
                  </div>
                </div>
                
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${activeField === 'email' ? 'active' : ''}`}
                      placeholder=" "
                      required
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                      value={formData.email}
                    />
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope"></i>
                      Correo Electrónico
                    </label>
                    <div className="input-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`form-input ${activeField === 'phone' ? 'active' : ''}`}
                      placeholder=" "
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={handleBlur}
                      value={formData.phone}
                    />
                    <label htmlFor="phone" className="form-label">
                      <i className="fas fa-phone"></i>
                      Teléfono (Opcional)
                    </label>
                    <div className="input-border"></div>
                  </div>
                </div>
                
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className={`form-input ${activeField === 'subject' ? 'active' : ''}`}
                      placeholder=" "
                      required
                      onChange={handleChange}
                      onFocus={() => handleFocus('subject')}
                      onBlur={handleBlur}
                      value={formData.subject}
                    />
                    <label htmlFor="subject" className="form-label">
                      <i className="fas fa-tag"></i>
                      Asunto
                    </label>
                    <div className="input-border"></div>
                  </div>
                </div>
              </div>
              
              <div className="input-group">
                <div className="input-wrapper">
                  <textarea
                    name="message"
                    id="message"
                    className={`form-input textarea ${activeField === 'message' ? 'active' : ''}`}
                    rows="5"
                    placeholder=" "
                    required
                    onChange={handleChange}
                    onFocus={() => handleFocus('message')}
                    onBlur={handleBlur}
                    value={formData.message}
                  />
                  <label htmlFor="message" className="form-label">
                    <i className="fas fa-comment-alt"></i>
                    Tu Mensaje
                  </label>
                  <div className="input-border"></div>
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                disabled={isSubmitting}
              >
                <div className="btn-content">
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Enviando Mensaje...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensaje</span>
                      <i className="fas fa-paper-plane"></i>
                    </>
                  )}
                </div>
                <div className="btn-background"></div>
              </button>

              {submitStatus === "success" && (
                <div className="status-message success" data-aos="fade-up">
                  <div className="status-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="status-content">
                    <h4>¡Mensaje Enviado!</h4>
                    <p>Te contactaremos pronto. Gracias por escribirnos.</p>
                  </div>
                </div>
              )}
              
              {submitStatus === "error" && (
                <div className="status-message error" data-aos="fade-up">
                  <div className="status-icon">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="status-content">
                    <h4>Error al Enviar</h4>
                    <p>Hubo un problema. Por favor, intenta nuevamente.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          <div className="contact-info">
            <div className="info-header">
              <div className="info-icon-main">
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3>Información de Contacto</h3>
              <p>Estamos aquí para ayudarte. Contáctanos a través de cualquiera de estos medios.</p>
            </div>
            
            <div className="info-items">
              <div className="info-item" data-aos="fade-left" data-aos-delay="100">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-text">
                  <h4>Dirección</h4>
                  <p>{data ? data.address : "Cargando..."}</p>
                </div>
                <div className="info-hover"></div>
              </div>
              
              <div className="info-item" data-aos="fade-left" data-aos-delay="200">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="info-text">
                  <h4>Teléfono</h4>
                  <p>{data ? data.phone : "Cargando..."}</p>
                </div>
                <div className="info-hover"></div>
              </div>
              
              <div className="info-item" data-aos="fade-left" data-aos-delay="300">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="info-text">
                  <h4>Email</h4>
                  <p>{data ? data.email : "Cargando..."}</p>
                </div>
                <div className="info-hover"></div>
              </div>
              
              <div className="info-item" data-aos="fade-left" data-aos-delay="400">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="info-text">
                  <h4>Horario de Atención</h4>
                  <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
                </div>
                <div className="info-hover"></div>
              </div>
            </div>
            
            <div className="social-links" data-aos="fade-up" data-aos-delay="500">
              <h4>Síguenos en Redes Sociales</h4>
              <p>Mantente conectado con nosotros</p>
              <div className="social-icons">
                <a href={data ? data.facebook : "/"} className="social-link facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href={data ? data.twitter : "/"} className="social-link twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href={data ? data.youtube : "/"} className="social-link youtube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" className="social-link instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-link linkedin">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Contact.propTypes = {
  data: PropTypes.shape({
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    facebook: PropTypes.string,
    twitter: PropTypes.string,
    youtube: PropTypes.string,
  }),
};

Contact.defaultProps = {
  data: {
    address: "4321 California St, San Francisco, CA 12345",
    phone: "+1 123 456 1234",
    email: "info@company.com",
    facebook: "/",
    twitter: "/",
    youtube: "/",
  },
};

export default Contact;