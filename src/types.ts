// These types describe our Laravel JSON responses. They do not validate JSON at runtime.
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  created_at: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  body: string;
  user_id: number;
  created_at: string;
}

export interface TicketDetails extends Ticket {
  comments: TicketComment[];
}

export interface TicketPage {
  // Laravel paginate() wraps the records in data alongside pagination metadata.
  data: Ticket[];
  current_page: number;
  last_page: number;
  total: number;
}
