import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { apiFetch } from "./api";
import CommentForm from "./CommentForm";
import type { TicketComment, TicketDetails as TicketDetailsData } from "./types";

export default function TicketDetails() {
  const { id } = useParams(); // Read :id from /tickets/:id.
  const [ticket, setTicket] = useState<TicketDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTicket() {
      setLoading(true);
      setError("");
      setTicket(null);

      try {
        const response = await apiFetch(`/tickets/${id}`, { signal: controller.signal });
        const data: TicketDetailsData = await response.json();
        if (!controller.signal.aborted) setTicket(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Failed to load ticket.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchTicket();
    return () => controller.abort();
  }, [id]);

  function handleCommentAdded(comment: TicketComment) {
    // Use the latest state and create new objects/arrays. Do not push into state.
    setTicket((currentTicket) => {
      // Ignore a late POST response if we have since opened another ticket.
      if (!currentTicket || currentTicket.id !== comment.ticket_id) return currentTicket;
      return { ...currentTicket, comments: [...currentTicket.comments, comment] };
    });
  }

  return (
    <section className="stack">
      <Link to="/tickets">← Back to tickets</Link>
      {loading ? <p role="status">Loading ticket…</p> : error ? (
        <p className="error" role="alert">{error}</p>
      ) : ticket && (
        <>
          <article className="panel stack">
            <p className="muted">Ticket #{ticket.id}</p>
            <h1>{ticket.title}</h1>
            <p>{ticket.status.replaceAll("_", " ")} · {ticket.priority} priority</p>
            <p className="preserve-lines">{ticket.description}</p>
            <p className="muted">Created {new Date(ticket.created_at).toLocaleString()}</p>
          </article>
          <h2>Comments ({ticket.comments.length})</h2>
          {ticket.comments.length === 0 ? <p>No comments yet.</p> : (
            <ul className="ticket-list">
              {ticket.comments.map((comment) => (
                <li key={comment.id} className="panel stack">
                  <p className="muted">User #{comment.user_id} · {new Date(comment.created_at).toLocaleString()}</p>
                  {/* Text interpolation escapes HTML; never render comment text as raw HTML. */}
                  <p className="preserve-lines">{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
          <CommentForm key={ticket.id} ticketId={ticket.id} onCommentAdded={handleCommentAdded} />
        </>
      )}
    </section>
  );
}
