import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login'; // Case-sensitive: Login.jsx
import Dashboard from "./pages/Dashboard";
import Library from "./pages/Library";
import Recommend from "./pages/Recommend"; // ✅ REQUIRED
import './styles/style.css';

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/library" element={<Library />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}
