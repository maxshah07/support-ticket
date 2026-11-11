import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "./api";
import type { User } from "./types";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    // The effect itself cannot be async because it must return a cleanup function.
    async function fetchUser() {
      try {
        const response = await apiFetch("/me", { signal: controller.signal });
        const data: User = await response.json();
        if (!controller.signal.aborted) setUser(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load your account.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchUser();
    return () => controller.abort(); // Cancel if this page unmounts.
  }, []); // No changing dependencies: fetch when the page mounts.

  if (loading) return <p role="status">Loading your account…</p>;
  if (error) return <p className="error" role="alert">{error}</p>;

  return (
    <section className="panel stack">
      <h1>Welcome, {user?.name}</h1>
      <p className="muted">{user?.email}</p>
      <p>View your tickets, filter by status or priority, and join the conversation.</p>
      <Link to="/tickets">View tickets →</Link>
    </section>
  );
}
