// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/style.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (mode === "login") {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const res = await axios.post("/token", formData, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("token_type", res.data.token_type);
        setMessage("✅ Login successful.");
        navigate("/dashboard");

      } else {
        // Registration mode
        if (!username || !email || !password) {
          setMessage("❌ Please fill in all fields.");
          return;
        }

        await axios.post("/register", {
          username,
          email,
          password
        }, {
          headers: { "Content-Type": "application/json" }
        });

        setMessage("✅ Registered successfully. You may now login.");
        setMode("login");
        setEmail("");
        setPassword("");
        setUsername("");
      }

    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "❌ An error occurred. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <h2>
        {mode === "login" ? "Login" : "Register"}
        <span className="version-tag">v2</span>
      </h2>

      <div className="tabs">
        <button
          onClick={() => setMode("login")}
          className={mode === "login" ? "active" : ""}
        >
          Login
        </button>
        <button
          onClick={() => setMode("register")}
          className={mode === "register" ? "active" : ""}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {mode === "register" && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
