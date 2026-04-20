import { useEffect, useState } from "react";
import "./UserDashboard.css";

function UserDashboard() {
  const [vista, setVista] = useState("crear");

  // 🔥 PROTECCIÓN DE RUTA
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!usuario) {
      window.location.href = "/";
    }
  }, []);

  // 🔥 LOGOUT
  const logout = () => {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  return (
    <div className="user-container">
      <div className="sidebar">
        <h2>PQRS</h2>

        <button onClick={() => setVista("crear")}>
          Crear PQRS
        </button>

        <button onClick={() => setVista("ver")}>
          Mis Solicitudes
        </button>

        <button onClick={() => setVista("stats")}>
          Estadísticas
        </button>

        <button onClick={() => setVista("perfil")}>
          Mi Perfil
        </button>

        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <div className="content">
        {vista === "crear" && <CrearPQRS />}
        {vista === "ver" && <VerPQRS />}
        {vista === "perfil" && <Perfil />}
        {vista === "stats" && <Stats />}
      </div>
    </div>
  );
}

export default UserDashboard;

///////////////////////
// 🔥 CREAR PQRS
///////////////////////

function CrearPQRS() {
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const usuario = JSON.parse(localStorage.getItem("user"));

  const enviarPQRS = async () => {
    if (!usuario) {
      alert("Sesión expirada");
      window.location.href = "/";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/pqrs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          descripcion,
          usuarioId: usuario.id,
        }),
      });

      if (response.ok) {
        alert("PQRS enviada");
        setTipo("");
        setDescripcion("");
      } else {
        alert("Error al enviar");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="card">
      <h2>Crear PQRS</h2>

      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="">Selecciona tipo</option>
        <option value="PETICION">Petición</option>
        <option value="QUEJA">Queja</option>
        <option value="RECLAMO">Reclamo</option>
      </select>

      <textarea
        placeholder="Describe tu solicitud..."
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <button onClick={enviarPQRS}>Enviar</button>
    </div>
  );
}

///////////////////////
// 🔥 VER PQRS
///////////////////////

function VerPQRS() {
  const [pqrs, setPqrs] = useState([]);
  const [filtro, setFiltro] = useState("");

  const usuario = JSON.parse(localStorage.getItem("user"));

  const cargarPQRS = () => {
  let url = "";

  // 🔥 MANEJO CORRECTO DEL FILTRO
  if (!filtro || filtro === "") {
    url = `http://localhost:8080/pqrs/usuario/${usuario.id}`;
  } else {
    url = `http://localhost:8080/pqrs/usuario/${usuario.id}/estado?estado=${filtro}`;
  }

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Error backend");
      return res.json();
    })
    .then((data) => {
      setPqrs(data || []); // 🔥 evita null / undefined
    })
    .catch((error) => {
      console.error(error);
      alert("Error cargando PQRS");
      setPqrs([]); // 🔥 evita pantalla blanca
    });
};

useEffect(() => {
  if (!usuario) {
    window.location.href = "/";
    return;
  }

  cargarPQRS();
}, [filtro]);

const eliminarPQRS = async (id) => {
  if (!confirm("¿Eliminar esta solicitud?")) return;

  try {
    const response = await fetch(
      `http://localhost:8080/pqrs/${id}`,
      { method: "DELETE" }
    );

    if (response.ok) {
      alert("PQRS eliminada");
      cargarPQRS();
    } else {
      alert("Error al eliminar");
    }
  } catch (error) {
    alert("Error de conexión");
  }
};

  const editarPQRS = async (item) => {
    const nuevaDescripcion = prompt("Editar descripción", item.descripcion);

    if (!nuevaDescripcion) return;

    try {
      const response = await fetch(
        `http://localhost:8080/pqrs/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            descripcion: nuevaDescripcion,
          }),
        }
      );

      if (response.ok) {
        alert("Actualizado");
        cargarPQRS();
      } else {
        alert("Error al editar");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  return (
    <div className="card">
      <h2>Mis Solicitudes</h2>

      <select
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      >
        <option value="">Todas</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="PROCESO">Proceso</option>
        <option value="RESUELTO">Resuelto</option>
      </select>

      {pqrs.length === 0 ? (
        <p>No tienes solicitudes</p>
      ) : (
        pqrs.map((item) => (
          <div key={item.id} className="pqrs-item">
            <h4>{item.tipo}</h4>

            <p>{item.descripcion}</p>

            <small className="fecha">
              🕒 {new Date(item.fecha).toLocaleString("es-CO")}
            </small>

            <div className="acciones">
              <span className={`estado ${item.estado?.toLowerCase()}`}>
                {item.estado}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-editar"
                  onClick={() => editarPQRS(item)}
                >
                  Editar
                </button>

                <button
                  className="btn-cancelar"
                  onClick={() => eliminarPQRS(item.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

///////////////////////
// 🔥 STATS
///////////////////////

function Stats() {
  const [stats, setStats] = useState({});
  const usuario = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`http://localhost:8080/${usuario.id}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => alert("Error cargando estadísticas"));
  }, []);

  return (
    <div className="card">
      <h2>Estadísticas</h2>

      <p>Total: {stats.total || 0}</p>
      <p>Pendientes: {stats.pendientes || 0}</p>
      <p>En proceso: {stats.proceso || 0}</p>
      <p>Resueltos: {stats.resueltas || 0}</p>
    </div>
  );
}

///////////////////////
// 🔥 PERFIL
///////////////////////

function Perfil() {
  const usuario = JSON.parse(localStorage.getItem("user"));

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [username, setUsername] = useState(usuario?.username || "");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const guardarCambios = async () => {
    setMensaje("");
    setError("");

    if (!nombre || !username) {
      setError("Nombre y usuario son obligatorios");
      return;
    }

    if (password && password.length < 4) {
      setError("La contraseña debe tener mínimo 4 caracteres");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/test/actualizar/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            username,
            password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data));
        setMensaje("Perfil actualizado correctamente 🔥");
      } else {
        setError("Error al actualizar");
      }
    } catch (error) {
      setError("Error de conexión");
    }
  };

  return (
    <div className="card">
      <h2>Mi Perfil</h2>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <div className="form-group">
        <label>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button onClick={guardarCambios}>
        Guardar cambios
      </button>
    </div>
  );
} 