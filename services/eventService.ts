import { loadUsers, saveUsers } from "./storage";
import type { EventItem, EventStatus } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  scheduleEventNotifications,
  cancelEventNotifications,
} from "./notificationService";

export async function listUserEvents(userId: string) {
  const users = await loadUsers();
  const u = users.find((x) => x.id === userId);
  return u?.events ?? [];
}

export async function addEvent(
  userId: string,
  data: Omit<
    EventItem,
    "id" | "created_date" | "updated_date" | "status" | "notificationIds"
  > & { status?: EventStatus }
) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");

  const now = new Date().toISOString();
  const event: EventItem = {
    id: uuidv4(),
    title: data.title,
    description: data.description ?? "",
    start_date: data.start_date,
    end_date: data.end_date,
    status: data.status ?? "active",
    created_date: now,
    updated_date: now,
  };

  // schedule notifications if active
  if (event.status === "active") {
    event.notificationIds = await scheduleEventNotifications(event);
  }

  users[idx].events.push(event);
  await saveUsers(users);
  return event;
}

export async function updateEvent(userId: string, event: EventItem) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  const eIdx = users[idx].events.findIndex((e) => e.id === event.id);
  if (eIdx === -1) throw new Error("Event not found");

  // cancel old notifications
  if (users[idx].events[eIdx].notificationIds?.length) {
    await cancelEventNotifications(users[idx].events[eIdx].notificationIds!);
  }

  const updated = { ...event, updated_date: new Date().toISOString() };

  // reschedule if active
  if (updated.status === "active") {
    updated.notificationIds = await scheduleEventNotifications(updated);
  } else {
    updated.notificationIds = [] as string[];
  }

  users[idx].events[eIdx] = updated;
  await saveUsers(users);
  return updated;
}

export async function softDeleteEvent(userId: string, eventId: string) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  const eIdx = users[idx].events.findIndex((e) => e.id === eventId);
  if (eIdx === -1) throw new Error("Event not found");

  const target = users[idx].events[eIdx];
  // cancel notifications
  if (target.notificationIds?.length)
    await cancelEventNotifications(target.notificationIds);

  users[idx].events[eIdx] = {
    ...target,
    status: "deleted",
    updated_date: new Date().toISOString(),
    notificationIds: [] as string[], // <-- typed
  };
  await saveUsers(users);
}

export async function setEventStatus(
  userId: string,
  eventId: string,
  status: EventItem["status"]
) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  const eIdx = users[idx].events.findIndex((e) => e.id === eventId);
  if (eIdx === -1) throw new Error("Event not found");

  const target = users[idx].events[eIdx];

  if (target.notificationIds?.length)
    await cancelEventNotifications(target.notificationIds);

  const updated = {
    ...target,
    status,
    updated_date: new Date().toISOString(),
    notificationIds: [] as string[], // <-- typed
  };
  if (status === "active") {
    updated.notificationIds = await scheduleEventNotifications(updated);
  }

  users[idx].events[eIdx] = updated;
  await saveUsers(users);
  return updated;
}
