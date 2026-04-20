import { useEffect, useState } from "react";
import "./UserDashboard.css";

const API = "https://pqrs-app-vgxn.onrender.com"; // 🔥 NUEVO

function AdminDashboard() {
  const [vista, setVista] = useState("ver");

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!usuario || usuario.role !== "ADMIN") {
      window.location.href = "/";
    }
  }, []);

  const logout = () => {
    if (confirm("¿Seguro que deseas cerrar sesión?")) {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  return (
    <div className="user-container">
      <div className="sidebar">
        <h2>ADMIN</h2>

        <button onClick={() => setVista("ver")}>
          Todas las PQRS
        </button>

        <button onClick={() => setVista("stats")}>
          Estadísticas Globales
        </button>

        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <div className="content">
        {vista === "ver" && <AdminPQRS />}
        {vista === "stats" && <AdminStats />}
      </div>
    </div>
  );
}

export default AdminDashboard;

//////////////////////////////
// 🔥 ADMIN PQRS
//////////////////////////////

function AdminPQRS() {
  const [pqrs, setPqrs] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [respuestas, setRespuestas] = useState({}); // 🔥 NUEVO

  const cargar = () => {
    let url = "";

    if (!filtro || filtro === "") {
      url = `${API}/pqrs/todas`;
    } else {
      url = `${API}/pqrs/estado?estado=${filtro}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Error backend");
        return res.json();
      })
      .then(data => setPqrs(data || []))
      .catch(() => {
        alert("Error cargando PQRS");
        setPqrs([]);
      });
  };

  useEffect(() => {
    cargar();
  }, [filtro]);

  const cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(
        `${API}/pqrs/${id}/estado?estado=${estado}`,
        { method: "PUT" }
      );

      if (res.ok) cargar();
      else alert("Error actualizando estado");
    } catch {
      alert("Error conexión");
    }
  };

  // 🔥 RESPONDER PQRS
  const responder = async (id) => {
    const texto = respuestas[id];

    if (!texto || texto.trim() === "") {
      alert("Escribe una respuesta");
      return;
    }

    try {
      const res = await fetch(
        `${API}/pqrs/${id}/responder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ respuesta: texto }),
        }
      );

      if (res.ok) {
        alert("Respuesta enviada ✅");
        setRespuestas({ ...respuestas, [id]: "" });
        cargar();
      } else {
        alert("Error al responder");
      }
    } catch {
      alert("Error conexión");
    }
  };

  return (
    <div className="card">
      <h2>Todas las PQRS</h2>

      <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
        <option value="">Todas</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="PROCESO">Proceso</option>
        <option value="RESUELTO">Resuelto</option>
      </select>

      {pqrs.length === 0 ? (
        <p>No hay PQRS</p>
      ) : (
        pqrs.map(item => (
          <div key={item.id} className="pqrs-item">

            <h4>{item.tipo}</h4>

            <p>
              <strong>
                👤 {item.nombre || "Sin nombre"} (@{item.username || "sin_user"})
              </strong>
            </p>

            <p>{item.descripcion}</p>

            <small className="fecha">
              🕒 {new Date(item.fecha).toLocaleString("es-CO")}
            </small>

            {/* 🔥 RESPUESTA EXISTENTE */}
            {item.respuestaAdmin && (
              <div style={{ marginTop: "10px", color: "#2ecc71" }}>
                💬 <strong>Respuesta:</strong> {item.respuestaAdmin}
                <br />
                <small>
                  {new Date(item.fechaRespuesta).toLocaleString("es-CO")}
                </small>
              </div>
            )}

            {/* 🔥 INPUT RESPUESTA */}
            {!item.respuestaAdmin && (
              <div style={{ marginTop: "10px" }}>
                <textarea
                  placeholder="Escribir respuesta..."
                  value={respuestas[item.id] || ""}
                  onChange={(e) =>
                    setRespuestas({
                      ...respuestas,
                      [item.id]: e.target.value,
                    })
                  }
                />

                <button onClick={() => responder(item.id)}>
                  Enviar respuesta
                </button>
              </div>
            )}

            <div className="acciones">
              <span className={`estado ${item.estado?.toLowerCase()}`}>
                {item.estado}
              </span>

              <div>
                <button onClick={() => cambiarEstado(item.id, "PENDIENTE")}>
                  ⏳
                </button>

                <button onClick={() => cambiarEstado(item.id, "PROCESO")}>
                  ⚙️
                </button>

                <button onClick={() => cambiarEstado(item.id, "RESUELTO")}>
                  ✅
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

//////////////////////////////
// 🔥 ADMIN STATS
//////////////////////////////

function AdminStats() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch(`${API}/pqrs/estadisticas-global`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setStats(data))
      .catch(() => {
        alert("Error cargando stats");
        setStats({});
      });
  }, []);

  return (
    <div className="card">
      <h2>Dashboard Global</h2>

      <p>Total: {stats.total || 0}</p>
      <p>Pendientes: {stats.pendientes || 0}</p>
      <p>En proceso: {stats.proceso || 0}</p>
      <p>Resueltos: {stats.resueltas || 0}</p>
    </div>
  );
}