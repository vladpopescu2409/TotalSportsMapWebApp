import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, logout } from "./firebase";
import Button from '@mui/material/Button';
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

      <div style={{ position: 'absolute', top: '10px', right: '10px'}}>
        <Button variant="contained" style={{ fontSize: '16px', padding: '15px', backgroundColor: 'black', color: 'white' }} onClick={logout}>
          Logout
        </Button>
      </div>
      
      {/* Render the EsriMapComponent here */}
      <EsriMapComponent />
    </div>
  );
}

export default Dashboard;