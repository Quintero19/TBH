import React from 'react';
import { Link } from "react-router-dom";
import '../styles/Login.css'; 

export default function RCP() {
  return (
    <>
    <div className="login-container">
      <div className="login-form">
        <center><h1><b>Recuperar Contraseña</b></h1></center>
        <br />
        <p>Por favor ingresa tu correo electronico</p>
        <form>
          <label>Correo</label>
          <input type="email" name="Correo" id="" />
        </form>
        <Link to="/login"><button>Confirmar</button></Link>
      </div>
      <Link to="/login"><button className='button-create'>Login</button></Link>
      <div className="login-image"></div>
    </div>
    </>
  );
}