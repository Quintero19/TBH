import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import emailjs from "emailjs-com";
import "../../styles/css/Contact.css";

const Contact = ({ data, adminEmail }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "" // Campo anti-spam
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitAttempts, setSubmitAttempts] = useState(0);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }
    if (!formData.subject.trim()) newErrors.subject = "El asunto es obligatorio";
    if (!formData.message.trim()) newErrors.message = "El mensaje es obligatorio";
    if (formData.phone && !/^[0-9+\s()-]+$/.test(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    
    // Verificar honeypot
    if (formData.honeypot) {
      console.log("Spam detected");
      return;
    }
    
    // Verificar intentos máximos
    if (submitAttempts >= 3) {
      setSubmitStatus("max_attempts");
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Datos para la plantilla del administrador
    const adminTemplateParams = {
      to_admin: adminEmail || "thebarberhouse2000@gmail.com",
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone || "No proporcionado",
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleString('es-ES')
    };

    // Datos para la plantilla de confirmación al usuario
    const userTemplateParams = {
      to_email: formData.email,
      from_name: "Equipo de Soporte",
      user_name: formData.name,
      subject: formData.subject,
      date: new Date().toLocaleString('es-ES')
    };

    // Primero enviar notificación al administrador
    emailjs.send(
      "service_dp4dz9u",
      "template_dmv5mqk",
      adminTemplateParams,
      "81YUzAZ_X-sFIiFIE"
    )
    .then(() => {
      // Luego enviar confirmación al usuario
      return emailjs.send(
        "service_dp4dz9u",
        "template_3f4ob34",
        userTemplateParams,
        "81YUzAZ_X-sFIiFIE"
      );
    })
    .then(
      (result) => {
        console.log(result.text);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "", honeypot: "" });
        setSubmitStatus("success");
        setIsSubmitting(false);
        setSubmitAttempts(0);
        
        // Limpiar localStorage después de envío exitoso
        localStorage.removeItem('contactFormData');
      },
      (error) => {
        console.log(error.text);
        setSubmitStatus("error");
        setIsSubmitting(false);
        setSubmitAttempts(prev => prev + 1);
      }
    );
  };

  // Persistencia de datos en localStorage
  useEffect(() => {
    localStorage.setItem('contactFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const savedData = localStorage.getItem('contactFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

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
              {/* Campo honeypot para protección contra spam */}
              
              <div style={{ opacity: 0, position: 'absolute', left: '-5000px' }}>
                
                <input
                  type="text"
                  id="honeypot"
                  name="honeypot"
                  tabIndex="-1"
                  autoComplete="off"
                  onChange={handleChange}
                  value={formData.honeypot}
                />
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${activeField === 'name' ? 'active' : ''} ${errors.name ? 'error' : ''}`}
                      placeholder=" "
                      required
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      value={formData.name}
                    />
                    <label htmlFor="name" className="form-label">
                      <i className="fas fa-user"></i>
                      Nombre Completo *
                    </label>
                    <div className="input-border"></div>
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                </div>
                
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${activeField === 'email' ? 'active' : ''} ${errors.email ? 'error' : ''}`}
                      placeholder=" "
                      required
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                      value={formData.email}
                    />
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope"></i>
                      Correo Electrónico *
                    </label>
                    <div className="input-border"></div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
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
                      className={`form-input ${activeField === 'phone' ? 'active' : ''} ${errors.phone ? 'error' : ''}`}
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
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>
                
                <div className="input-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className={`form-input ${activeField === 'subject' ? 'active' : ''} ${errors.subject ? 'error' : ''}`}
                      placeholder=" "
                      required
                      onChange={handleChange}
                      onFocus={() => handleFocus('subject')}
                      onBlur={handleBlur}
                      value={formData.subject}
                    />
                    <label htmlFor="subject" className="form-label">
                      <i className="fas fa-tag"></i>
                      Asunto *
                    </label>
                    <div className="input-border"></div>
                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                  </div>
                </div>
              </div>
              
              <div className="input-group">
                <div className="input-wrapper">
                  <textarea
                    name="message"
                    id="message"
                    className={`form-input textarea ${activeField === 'message' ? 'active' : ''} ${errors.message ? 'error' : ''}`}
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
                    Tu Mensaje *
                  </label>
                  <div className="input-border"></div>
                  {errors.message && <span className="error-message">{errors.message}</span>}
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
                <div className="status-message success">
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
                <div className="status-message error">
                  <div className="status-icon">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="status-content">
                    <h4>Error al Enviar</h4>
                    <p>Hubo un problema. Por favor, intenta nuevamente.</p>
                  </div>
                </div>
              )}
              
              {submitStatus === "max_attempts" && (
                <div className="status-message max_attempts">
                  <div className="status-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="status-content">
                    <h4>Demasiados intentos</h4>
                    <p>Por favor, espera unos minutos antes de intentar nuevamente.</p>
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
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-text">
                  <h4>Dirección</h4>
                  <p>{data ? data.address : "Cargando..."}</p>
                </div>
                <div className="info-hover"></div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div className="info-text">
                  <h4>Teléfono</h4>
                  <p>{data ? data.phone : "Cargando..."}</p>
                </div>
                <div className="info-hover"></div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="info-text">
                  <h4>Email</h4>
                  <p>{data ? data.email : "Cargando..."}</p>
                </div>
                <div className="info-hover"></div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="info-text">
                  <h4>Horario de Atención</h4>
                  <p>9am a 9pm</p>
                </div>
                <div className="info-hover"></div>
              </div>
            </div>
            
            {/* <div className="social-links">
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
              </div>
            </div> */}
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
  adminEmail: PropTypes.string
};

Contact.defaultProps = {
  data: {
    address: "carrera 36 b #102 c-11",
    phone: "313323523",
    email: "calle@ggasd",
    facebook: "fb.com",
    twitter: "twitter.com",
    youtube: "youtube.com",
  },
  adminEmail: "thebarberhouse2000@gmail.com"
};

export default Contact;