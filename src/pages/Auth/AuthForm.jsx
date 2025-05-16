import React, { useState } from 'react';
import styles from '../../styles/css/AuthForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faEnvelope, faLock, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const URL= 'https://tbh-api-production-c79a.up.railway.app/'

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin 
      ? `${URL}api/auth/login`: `${URL}api/auth/register`;

    const payload = isLogin 
      ? { Correo: correo, Password: password }
      : { Documento: documento, Correo: correo, Password: password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      

      if (response.ok) {
          const data = await response.json();
          console.log('Respuesta API:', data);

          if (isLogin) {
            const token = data.data.token;
            const rolId = data.data.usuario.Rol_Id;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('rol', rolId);

            setMessage('¡Login exitoso!');

            const rolRoutes = {
              1: '/admin/dashboard',
              2: '/cliente/home',
            };
            window.location.href = rolRoutes[rolId] || '/';
          } else {
            setMessage('¡Registro exitoso!');
          }

      } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Error en la operación.';
          alert(errorMessage);
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isLogin ? '' : styles.active}`}>
      <div className={`${styles['form-box']} ${isLogin ? styles.login : styles.register}`}>
        <form onSubmit={handleSubmit}>
          <h1>{isLogin ? 'Ingresar' : 'Registro De Cliente'}</h1>

          {!isLogin && (
            <div className={styles['input-box']}>
              <input
                type="text"
                placeholder="Documento"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
              />
              <i className={styles.icon}>
                <FontAwesomeIcon icon={faIdCard} />
              </i>
            </div>
          )}

          <div className={styles['input-box']}>
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <i className={styles.icon}>
              <FontAwesomeIcon icon={faEnvelope} />
            </i>
          </div>

          <div className={styles['input-box']}>
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i className={styles.icon}>
              <FontAwesomeIcon icon={faLock} />
            </i>
          </div>

          {isLogin && (
            <div className={styles['forgot-link']}>
              <a href="/rcp">¿Has olvidado tu contraseña?</a>
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarse'}
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>
      </div>

      <div className={styles['toggle-box']}>
        <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
          <a href="/" style={{ color: 'inherit' }}>
            <div><FontAwesomeIcon icon={faArrowLeft} style={{ color: "#Ffff" }} /></div>
          </a>
          <button className={styles.btn} onClick={() => setIsLogin(false)}>Registro</button>
        </div>
        <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
          <a href="/">
            <div><FontAwesomeIcon icon={faArrowRight} style={{ color: "#Ffff" }} /></div>
          </a>
          <button className={styles.btn} onClick={() => setIsLogin(true)}>Ingreso</button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
