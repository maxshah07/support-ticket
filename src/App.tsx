import { useState } from "react";
import { Link, Navigate, Outlet, Route, Routes } from "react-router";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Navbar from "./Navbar";
import Tickets from "./Tickets";
import TicketDetails from "./TicketDetails";

function ProtectedRoutes({ token }: { token: string | null }) {
  // Outlet renders the matched child route. The API still enforces real security.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  // Storage survives a refresh; state makes the navbar update immediately.
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("token"));

  function handleLogin(newToken: string) {
    sessionStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function handleLogout() {
    sessionStorage.removeItem("token");
    setToken(null);
  }

  return (
    <>
      <Navbar isLoggedIn={Boolean(token)} onLogout={handleLogout} />
      <main className="page">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route element={<ProtectedRoutes token={token} />}>
            <Route path="/" element={<Home />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
          </Route>
          <Route path="*" element={<><h1>Page not found</h1><Link to="/">Go home</Link></>} />
        </Routes>
      </main>
    </>
  );
}
