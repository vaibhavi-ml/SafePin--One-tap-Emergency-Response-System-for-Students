import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Home from "./Home";
import HostelSOS from "./HostelSOS";
import CampusSOS from "./CampusSOS";
import AdminDashboard from "./AdminDashboard";


function App() {
  const { user } = useAuth();

  return (
    <>
      <div className="navbar">
        <div>
  <h2 style={{ margin: 0 }}>SafePin</h2>
  <small style={{ color: "#5f6368" }}>
    Emergency Response System
  </small>
</div>

        <div>
          {!user && <Link to="/login">Login</Link>}
        </div>
      </div>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sos/hostel" element={<HostelSOS />} />
          <Route path="/sos/campus" element={<CampusSOS />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          <Route path="/admin" element={<AdminDashboard />} />

        </Routes>

      </div>
    </>
  );
}

export default App;

