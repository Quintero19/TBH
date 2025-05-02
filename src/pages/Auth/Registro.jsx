import React from 'react';
import { Link } from "react-router-dom";
import '../styles/Login.css'; 

export default function Registro() {
  return (
    <>
    <div className="login-container">
      <div className="login-form">
        <center><h1><b>Registro</b></h1></center>
        <form>
          <label>Documento</label>
          <input type="text" name="Documento" id="" />
          <label>Nombre</label>
          <input type="text" name="Nombre" id="" />
          <label>Celular</label>
          <input type="text" name="Documento" id="" />
          <label>Correo</label>
          <input type="email" name="Nombre" id="" />
          <label>Fecha De Nacimiento</label>
          <input type="date" name="Documento" id="" />
        </form>
        <Link to="/login"><button>Registrarse</button></Link>
      </div>
      <Link to="/login"><button className='button-create'>Login</button></Link>
      <div className="login-image"></div>
    </div>
    </>
  );
}