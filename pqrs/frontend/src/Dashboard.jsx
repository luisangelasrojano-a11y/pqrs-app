function Dashboard() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {user ? (
        <>
          <p>Bienvenido: {user.username}</p>
          <p>Rol: {user.role}</p>
        </>
      ) : (
        <p>No hay sesión</p>
      )}

      <button onClick={() => {
        localStorage.removeItem("usuario");
        window.location.href = "/";
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default Dashboard;