import React, { useState } from 'react';
import styles from '../../styles/css/AuthForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faEnvelope, faEye, faEyeSlash, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const BASE_URL = 'http://localhost:3000/api';
const ENDPOINTS = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  me: `${BASE_URL}/me/`,
};

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);     
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!isLogin && password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? ENDPOINTS.login : ENDPOINTS.register;
    const payload = isLogin
      ? { Correo: correo, Password: password }
      : { Documento: documento, Correo: correo, Password: password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (isLogin) {
          setMessage('¡Login exitoso!');

          const meResponse = await fetch(ENDPOINTS.me, {
            credentials: 'include',
          });

          if (meResponse.ok) {
            const { user } = await meResponse.json();
            console.log('Usuario decodificado:', user);

            const rolRoutes = {
              1: '/admin/dashboard',
              2: '/usuario/index',
            };
            window.location.href = rolRoutes[user.rol_id] || '/';
          } else {
            setMessage('No se pudo obtener información del usuario.');
          }
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i className={styles.icon} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </i>
          </div>

          {!isLogin && (
            <div className={styles['input-box']}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <i className={styles.icon} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </i>
            </div>
          )}

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
            <div><FontAwesomeIcon icon={faArrowLeft} style={{ color: "#fff" }} /></div>
          </a>
          <button className={styles.btn} onClick={() => setIsLogin(false)}>Registro</button>
        </div>
        <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
          <a href="/">
            <div><FontAwesomeIcon icon={faArrowRight} style={{ color: "#fff" }} /></div>
          </a>
          <button className={styles.btn} onClick={() => setIsLogin(true)}>Ingreso</button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
