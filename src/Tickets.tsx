import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "./api";
import type { TicketPage } from "./types";

export default function Tickets() {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<TicketPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTickets() {
      setLoading(true);
      setError("");

      // URLSearchParams safely builds/encodes a query string.
      // Omit empty filters: Laravel's `sometimes|in:...` rejects empty strings.
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      try {
        const response = await apiFetch(`/tickets?${params}`, { signal: controller.signal });
        const data: TicketPage = await response.json();
        if (!controller.signal.aborted) setResult(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load tickets.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchTickets();
    // A slower old request must not overwrite results for the latest filters.
    return () => controller.abort();
  }, [status, priority, page]); // Refetch whenever any of these values changes.

  return (
    <section className="stack">
      <h1>Your tickets</h1>
      <div className="panel filters">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(event) => {
            setStatus(event.target.value);
            setPage(1); // A new filter might have fewer pages than the old one.
          }}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={priority} onChange={(event) => {
            setPriority(event.target.value);
            setPage(1);
          }}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {loading ? <p role="status">Loading tickets…</p> : error ? (
        <p className="error" role="alert">{error}</p>
      ) : result && (
        <>
          <p className="muted">{result.total} ticket(s) found</p>
          {result.data.length === 0 ? <p>No tickets match these filters.</p> : (
            <ul className="ticket-list">
              {result.data.map((ticket) => (
                // Use a stable database ID as the key, not the array index.
                <li key={ticket.id} className="panel">
                  <h2><Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link></h2>
                  <p className="muted">#{ticket.id} · {ticket.status.replaceAll("_", " ")} · {ticket.priority} priority</p>
                  <p className="ticket-preview">{ticket.description}</p>
                </li>
              ))}
            </ul>
          )}
          <nav className="actions" aria-label="Ticket pagination">
            <button type="button" disabled={result.current_page <= 1} onClick={() => setPage((previous) => previous - 1)}>Previous</button>
            <span>Page {result.current_page} of {result.last_page}</span>
            <button type="button" disabled={result.current_page >= result.last_page} onClick={() => setPage((previous) => previous + 1)}>Next</button>
          </nav>
        </>
      )}
    </section>
  );
}
