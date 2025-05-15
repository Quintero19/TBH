import React, { useState } from 'react';
import styles from '../../styles/css/AuthForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faEnvelope, faLock,faArrowLeft,faArrowRight  } from '@fortawesome/free-solid-svg-icons';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const endpoint = isLogin 
      ? 'https://tbh-api-production-c79a.up.railway.app/api/auth/login' 
      : 'https://tbh-api-production-c79a.up.railway.app/api/auth/register';

    const payload = isLogin 
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(isLogin ? '¡Login exitoso!' : '¡Registro exitoso!');
        console.log('Respuesta API:', data);
        // token en localStorage, redirigir, etc.
      } else {
        setMessage(data.message || 'Error en la operación.');
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
            <h1>{isLogin ? 'Ingresar' : 'Registro'}</h1>

            {!isLogin && (
              <div className={styles['input-box']}>
                <input
                  type="text"
                  placeholder="Documento"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <div><FontAwesomeIcon icon={faArrowLeft} style={{color: "#Ffff",}}/></div>
           </a>
          <button className={styles.btn} onClick={() => setIsLogin(false)}>Registro</button>
          </div>
          <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
          <a href="/">
              <div><FontAwesomeIcon icon={faArrowRight} style={{color: "#Ffff",}} /></div>
           </a>
          <button className={styles.btn} onClick={() => setIsLogin(true)}>Ingreso</button>
          </div>
        </div>
      </div>
  );
};

export default AuthForm;
