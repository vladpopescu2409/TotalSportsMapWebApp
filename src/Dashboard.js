import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, logout } from "./firebase";
import EsriMapComponent from "./EsriMapComponent"; // Make sure to provide the correct path

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
  }, [user, loading, navigate]);

  return (
    <div className="dashboard">
      <button className="dashboard__btn" onClick={logout}>
        Logout
      </button>
      
      {/* Render the EsriMapComponent here */}
      <EsriMapComponent />
    </div>
  );
}

export default Dashboard;