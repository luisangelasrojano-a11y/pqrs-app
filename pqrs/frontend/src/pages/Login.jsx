import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ close }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const iniciarSesion = async () => {
    if (!username || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/test/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        alert("Credenciales incorrectas");
        return;
      }

      const data = await response.json();

      // 🔥 VALIDACIÓN CRÍTICA
      if (!data || !data.id) {
        alert("Error en respuesta del servidor");
        return;
      }

      // 🔥 ASEGURAR ROLE (CLAVE DEL ADMIN)
      const userData = {
        ...data,
        role: data.role || "USER", // fallback seguro
      };

      // 🔥 GUARDAR
      localStorage.setItem("user", JSON.stringify(userData));

      alert("Login exitoso");

      // 🔥 REDIRECCIÓN CORRECTA
      if (userData.role === "ADMIN") {
        navigate("/admin"); // 🔥 CAMBIO IMPORTANTE
      } else {
        navigate("/user");
      }

      close();
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-box">
        <span className="close" onClick={close}>
          ×
        </span>

        <h2>Sign in</h2>

        <input
          type="text"
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

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <span>Forgot password?</span>
        </div>

        <button onClick={iniciarSesion}>Sign in</button>

        <div className="register-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;