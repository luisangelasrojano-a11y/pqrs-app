import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const API = "https://pqrs-app-vgxn.onrender.com"; // 🔥 NUEVO

function Register() {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState(""); // USER o ADMIN

  // 🔥 TUS STATES (NO CAMBIES LOS QUE YA TENÍAS)
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [documento, setDocumento] = useState("");

  const registrar = async () => {
    try {
      const body =
        tipo === "USER"
          ? {
              nombre,
              username,
              password,
              role: "USER",
            }
          : {
              nombre,
              username, // 🔥 agregado
              password,
              documento,
              role: "ADMIN",
            };

      const response = await fetch(`${API}/pqrs/register`, { // 🔥 CAMBIO CLAVE
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert("Registro exitoso");
        navigate("/");
      } else {
        alert("Error en registro");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <h2>Register</h2>

        {!tipo && (
          <>
            <p className="subtitle">¿Quién eres?</p>

            <div className="roles">
              <button onClick={() => setTipo("USER")}>
                Usuario
              </button>

              <button
                className="admin"
                onClick={() => setTipo("ADMIN")}
              >
                Administrador
              </button>
            </div>
          </>
        )}

        {/* 🔥 FORM USER */}
        {tipo === "USER" && (
          <div className="form">
            <input
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={registrar}>
              Registrarse
            </button>
          </div>
        )}

        {/* 🔥 FORM ADMIN */}
        {tipo === "ADMIN" && (
          <div className="form">
            <input
              placeholder="ID"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
            />

            <input
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            {/* 🔥 NUEVO INPUT */}
            <input
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={registrar}>
              Crear Admin
            </button>
          </div>
        )}

        {tipo && (
          <p className="back" onClick={() => setTipo("")}>
            ← Volver
          </p>
        )}

        <p className="login-link">
          ¿Ya tienes cuenta?{" "}
          <span onClick={() => navigate("/")}>
            Iniciar sesión
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;