export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string; // bcrypt hash
  created_date: string;
  updated_date: string;
  events: EventItem[]; // user-scoped events
};

export type EventStatus = "active" | "inactive" | "deleted" | "canceled";

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  start_date: string; // ISO
  end_date: string; // ISO
  status: EventStatus;
  created_date: string;
  updated_date: string;
  notificationIds?: string[]; // ids from expo-notifications
};
