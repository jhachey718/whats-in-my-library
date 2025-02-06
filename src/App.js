import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";
import { getHashParams } from "./util/auth";
import { Container } from "react-bootstrap";
import { useState, useEffect } from "react";
function App() {
  const [params, setParams] = useState();

  // when the component mounts, check the URL for authentication
  // data, if it is present, update the parameters state
  useEffect(() => {
    const authData = getHashParams(window.location);
    console.log("Auth Data:", authData);
    if (authData) {
      if (authData.path === "error") {
        alert("There was an error during the authentication.");
      } else {
        setParams(authData);
      }
    }
  }, []);

  // get new parameters, using the current refresh token
  const refreshToken = () => {
    return fetch(
      `/.netlify/functions/refresh_token?refresh_token=${params.refresh_token}`
    )
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        setParams(jsonResponse);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        height: "auto",
        width: "100vw",
      }}
    >
      <h1 className="text-center text-white" style={{ marginTop: "3rem" }}>
        What's in my Library?
      </h1>
      {params ? (
        <Dashboard code={params.access_token} />
      ) : (
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "75vh" }}
        >
          <a
            className="btn btn-dark"
            style={{
              "--bs-btn-padding-y": "1.5rem",
              "--bs-btn-padding-x": "2.5rem",
              "--bs-btn-font-size": "2rem",
              backgroundColor: "rgba(0, 0, 0, 0.35)", // Semi-transparent black
              color: "#fff",
            }}
            href="/.netlify/functions/login"
          >
            Login With Spotify
          </a>
        </Container>
      )}
      ;
    </div>
  );
}

export default App;
