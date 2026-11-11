import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { apiFetch } from "./api";

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function Navbar({ isLoggedIn, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      // Revoke the server token BEFORE removing our local copy.
      await apiFetch("/logout", { method: "POST" });
      onLogout();
      navigate("/login", { replace: true });
    } catch (err) {
      // Keep the token on a network/server error so the user can retry revoking it.
      setError(err instanceof Error ? err.message : "Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="nav-content">
        <Link to="/" className="brand">Support Ticket</Link>
        <div className="actions">
          {isLoggedIn ? (
            <>
              <NavLink to="/" end>Home</NavLink>
              <NavLink to="/tickets">Tickets</NavLink>
              <button type="button" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </>
          ) : <Link to="/login">Login</Link>}
        </div>
      </nav>
      {error && <p className="error nav-error" role="alert">{error}</p>}
    </header>
  );
}
