import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { auth, logout } from "./firebase";
import Button from '@mui/material/Button';
import EsriMapComponent from "./EsriMapComponent";
import Map from "./Map"

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
  }, [user, loading, navigate]);

  return (
    <div className="dashboard">
      <EsriMapComponent />
      {/* <Map /> */}

      <div className="dashboard__btn-container">
        <Button class="logoutButton"
          className="dashboard__btn"
          variant="contained"
          style={{backgroundColor: 'black', color: 'white' }}
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;