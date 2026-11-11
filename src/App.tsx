import { useState } from "react";
import { Link, Navigate, Outlet, Route, Routes } from "react-router";
import "./App.css";
import Home from "./Home";
import Login from "./Login";
import Navbar from "./Navbar";
import Tickets from "./Tickets";
import TicketDetails from "./TicketDetails";

function ProtectedRoutes({ token }: { token: string | null }) {
  // This component is used by the PARENT route containing our private pages.
  // React Router renders it when one of its child routes matches the URL.

  if (!token) {
    // No token: redirect to the login page.
    // "replace" replaces the current browser history entry.
    // The private page is not rendered because we do not return an Outlet.
    return <Navigate to="/login" replace />;
  }

  // Outlet is a placeholder for the matching CHILD route's element.
  //
  // React Router looks at the current URL and displays the appropriate page:
  //   "/"          -> <Home />
  //   "/tickets"   -> <Tickets />
  //   "/tickets/5" -> <TicketDetails />
  //
  // Only the matching page appears here, not all three pages.
  // Without this Outlet, the parent's child pages would not be displayed.
  //
  // Outlet does not handle authentication itself. Our condition above does.
  // Laravel must still check that the token is valid and authorise API requests.
  return <Outlet />;
}

export default function App() {
  // Storage remembers the token across refreshes.
  // React state makes the UI update immediately when login/logout changes it.
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("token"),
  );

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
      {/* Outside Routes, so the navbar stays visible on every page. */}
      <Navbar isLoggedIn={Boolean(token)} onLogout={handleLogout} />

      <main className="page">
        {/* Routes matches the current browser URL against our route definitions. */}
        <Routes>
          {/* "path" is the URL to match; "element" is what should be displayed. */}
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {/*
            This is a PARENT route. It has no path, so it adds no URL segment.
            Instead, it groups pages that share the ProtectedRoutes check.

            The nested Route elements below are its CHILD routes.
            Their page components appear where ProtectedRoutes renders Outlet.

            Example: visiting /tickets matches this parent and its /tickets child.
            ProtectedRoutes renders, checks the token, then either:
              - returns Outlet, which displays Tickets; or
              - returns Navigate, which redirects to /login.
          */}
          <Route element={<ProtectedRoutes token={token} />}>
            <Route path="/" element={<Home />} />
            <Route path="/tickets" element={<Tickets />} />

            {/* :id matches a variable URL segment, such as 5 in /tickets/5. */}
            {/* TicketDetails reads this value using useParams(). */}
            <Route path="/tickets/:id" element={<TicketDetails />} />
          </Route>

          {/* "*" handles URLs that do not match one of our defined pages. */}
          <Route
            path="*"
            element={
              <>
                <h1>Page not found</h1>
                <Link to="/">Go home</Link>
              </>
            }
          />
        </Routes>
      </main>
    </>
  );
}
