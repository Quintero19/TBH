import React from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const handleUserLogin = () => {
    localStorage.setItem("role", "user");
  };

  const handleAdminLogin = () => {
    localStorage.setItem("role", "admin");
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <center>
          <h1><b>Login</b></h1>
        </center>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Correo</label>
          <input type="text" name="Correo" />
          <label>Contraseña</label>
          <input type="password" name="Contraseña" />
        </form>
        
        <Link to="/recuperar_contrasena">¿Has olvidado tu contraseña?</Link>

        <Link to="/">
          <button onClick={handleUserLogin}>Ingresar como usuario</button>
        </Link>

        <Link to="/admin">
          <button onClick={handleAdminLogin}>Ingresar como admin</button>
        </Link>
      </div>

      <Link to="/registro">
        <button className="button-create">Crear Cuenta</button>
      </Link>

      <div className="login-image"></div>
    </div>
  );
}
