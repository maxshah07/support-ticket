import { useState, type SubmitEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { apiFetch } from "./api";

interface InputProps {
  field: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}

function Input({ field, type, value, onChange, autoComplete }: InputProps) {
  return (
    <div className="field">
      <label htmlFor={field}>{field === "email" ? "Email" : "Password"}</label>
      <input
        id={field}
        name={field}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
      />
    </div>
  );
}

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); // Handle the form in React instead of reloading the page.
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (typeof data.token !== "string" || !data.token) {
        throw new Error("The API did not return a login token.");
      }

      // A child calls a parent callback to update shared authentication state.
      onLogin(data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false); // Runs whether the request succeeds or fails.
    }
  }

  return (
    <section className="panel login-panel">
      <h1>Login</h1>
      <p className="muted">Use an existing account from your Support Ticket API.</p>
      {searchParams.get("expired") === "1" && <p role="status">Your session expired. Please log in again.</p>}
      <form onSubmit={handleSubmit} className="stack">
        {/* Controlled inputs: React state is the source of each input's value. */}
        <Input field="email" type="email" value={email} onChange={setEmail} autoComplete="username" />
        <Input field="password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Logging in…" : "Login"}</button>
      </form>
    </section>
  );
}
