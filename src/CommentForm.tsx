import { useState, type SubmitEvent } from "react";
import { apiFetch } from "./api";
import type { TicketComment } from "./types";

interface CommentFormProps {
  ticketId: number;
  onCommentAdded: (comment: TicketComment) => void;
}

export default function CommentForm({ ticketId, onCommentAdded }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(`/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // JavaScript objects must be serialized to send them as JSON.
        body: JSON.stringify({ body: body.trim() }),
      });
      const comment: TicketComment = await response.json();
      onCommentAdded(comment); // Let the parent update the comments it owns.
      setBody(""); // Only clear a draft after the server accepts it.
      setSuccess("Comment added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel stack">
      <div className="field">
        <label htmlFor="comment">Add a comment</label>
        <textarea id="comment" rows={4} value={body} onChange={(event) => {
          setBody(event.target.value);
          setSuccess("");
        }} required maxLength={2000} disabled={submitting} aria-describedby="comment-limit" />
        <small id="comment-limit" className="muted">{body.length}/2000 characters</small>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
      <button type="submit" disabled={submitting || !body.trim()}>
        {submitting ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
