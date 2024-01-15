import React from "react";
import { BrowserRouter , Route, Routes} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Reset from "./Reset";
import Dashboard from "./Dashboard"
import RatingFormFootball from "./RatingFormFootball";
import RatingFormBasketball from "./RatingFormBasketball";
import RatingFormTennis from "./RatingFormTennis";
import Map from "./Map";

// Your App component
function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/dashboard" element={<Dashboard />} />
          <Route exact path="/ratingformbasketball" element={<RatingFormBasketball />} />
          <Route exact path="/ratingformfootball" element={<RatingFormFootball />} />
          <Route exact path="/ratingformtennis" element={<RatingFormTennis/>} />
          <Route exact path="/map" element={<Map/>} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
        </Routes>
    </BrowserRouter>
  </div>
  );
}

export default App;