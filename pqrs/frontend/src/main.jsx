import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    {path === "/dashboard" ? <Dashboard /> : <App />}
  </>
);