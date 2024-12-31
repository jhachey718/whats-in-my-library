import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const code = new URLSearchParams(window.location.search).get("code");
function App() {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      {code ? <Dashboard code={code} /> : <Login />};
    </div>
  );
}

export default App;
