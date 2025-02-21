import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./components/Dashboard";
import LoginButton from "./components/LoginButton";
import Rules from "./components/Rules";
import { getHashParams } from "./util/auth";
import { Container } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
function App() {
  const [params, setParams] = useState();
  const [isPremium, setIsPremium] = useState(true);
  const hasRefreshed = useRef(false);

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
    } else if (window.location.pathname !== "/") {
      window.location.replace("/");
    }
  }, []);

  const getUserInfo = async () => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${params.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const data = await response.json();
      const productType = data.product; // Capturing the 'product' string

      console.log("User Product Type:", productType);
      productType === "premium" ? setIsPremium(true) : setIsPremium(false);
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  };

  // get new parameters, using the current refresh token
  const refreshToken = () => {
    console.log("Refreshing...");
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

  // Timer to refresh token every 55 minutes
  useEffect(() => {
    if (!hasRefreshed.current && params) {
      hasRefreshed.current = true;
      setTimeout(() => {
        refreshToken();
      }, 10000);
    }
    if (params) {
      getUserInfo();
      const timer = setTimeout(() => {
        refreshToken();
      }, 55 * 60 * 1000); // 55 minutes in milliseconds

      // Cleanup the timer when the component unmounts or params change
      return () => clearTimeout(timer);
    }
  }, [params]);

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
      <div
        // className="d-inline-flex gap-3 justify-content-center align-items-center"
        style={{ marginTop: "0.5rem", position: "relative" }}
      >
        <Rules />
        <h1 className="text-center text-white">What's in my Library?</h1>
      </div>
      {params && !isPremium && (
        <h2
          className="text-white text-center position-absolute start-50 translate-middle"
          style={{ top: "25%" }}
        >
          Sorry you need a Spotify Premium account :<span>&#40;</span>
        </h2>
      )}
      {params && isPremium ? (
        <Dashboard accessToken={params.access_token} />
      ) : (
        <LoginButton />
      )}
      ;
    </div>
  );
}

export default App;
