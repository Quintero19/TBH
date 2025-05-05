import React, { useState } from 'react';
import styles from '../../styles/css/AuthForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.container} ${isLogin ? '' : styles.active}`}>
        <div className={`${styles['form-box']} ${isLogin ? styles.login : styles.register}`}>
          <form action="#">
            <h1>{isLogin ? 'Login' : 'Registration'}</h1>

            <div className={styles['input-box']}>
              <input type="text" placeholder="Username" required />
              <i className={styles.icon}>
                <FontAwesomeIcon icon={faUser} />
              </i>
            </div>

            {!isLogin && (
              <div className={styles['input-box']}>
                <input type="email" placeholder="Email" required />
                <i className={styles.icon}>
                  <FontAwesomeIcon icon={faEnvelope} />
                </i>
              </div>
            )}

            <div className={styles['input-box']}>
              <input type="password" placeholder="Password" required />
              <i className={styles.icon}>
                <FontAwesomeIcon icon={faLock} />
              </i>
            </div>

            {isLogin && (
              <div className={styles['forgot-link']}>
                <a href="#">Forgot Password?</a>
              </div>
            )}

            <button type="submit" className={styles.btn}>
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>

        <div className={styles['toggle-box']}>
          <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button className={styles.btn} onClick={() => setIsLogin(false)}>Register</button>
            <br />
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Regresar
            </a>
          </div>
          <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button className={styles.btn} onClick={() => setIsLogin(true)}>Login</button>
            <br />
            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Regresar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
