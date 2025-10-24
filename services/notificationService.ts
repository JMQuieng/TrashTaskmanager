import * as Notifications from "expo-notifications";
import { subMinutes, isAfter } from "date-fns";
import { Platform } from "react-native";
import { EventItem } from "../types";

// ---- Notification behavior (one handler only) ----
Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true, // iOS
      shouldShowList: true, // iOS
    }),
});

// ---- Android channel (do once, e.g. app start) ----
export async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFFFFF",
    });
  }
}

// ---- Permissions ----
export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted")
    throw new Error("Notification permission not granted");
}

// ---- Trigger helper (single definition) ----
const makeDateTrigger = (date: Date): Notifications.NotificationTriggerInput =>
  ({ type: "date", date } as Notifications.NotificationTriggerInput);

// ---- Guarded scheduler ----
const scheduleIfFuture = async (
  date: Date,
  content: Notifications.NotificationContentInput
): Promise<string | undefined> => {
  if (!isAfter(date, new Date())) return undefined;
  return Notifications.scheduleNotificationAsync({
    content,
    trigger: makeDateTrigger(date),
  });
};

// ---- Public API ----
export async function scheduleEventNotifications(event: EventItem) {
  await ensureAndroidChannel(); // ensure channel exists on Android
  await requestPermissions().catch(() => {});

  const start = new Date(event.start_date);
  const end = new Date(event.end_date);

  const ids = await Promise.all([
    // 10 minutes before start
    scheduleIfFuture(subMinutes(start, 10), {
      title: "Event in 10 minutes",
      body: `${event.title} starts at ${start.toLocaleTimeString()}`,
      data: { eventId: event.id, type: "10-before" },
    }),
    // 5 minutes before start
    scheduleIfFuture(subMinutes(start, 5), {
      title: "Event in 5 minutes",
      body: `${event.title} starts at ${start.toLocaleTimeString()}`,
      data: { eventId: event.id, type: "5-before" },
    }),
    // At start
    scheduleIfFuture(start, {
      title: "Event started",
      body: `${event.title} is starting now`,
      data: { eventId: event.id, type: "start" },
    }),
    // At end
    scheduleIfFuture(end, {
      title: "Event ended",
      body: `${event.title} has ended`,
      data: { eventId: event.id, type: "end" },
    }),
  ]);

  // keep only real IDs
  return ids.filter((x): x is string => Boolean(x));
}

export async function cancelEventNotifications(ids: string[]) {
  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id))
  );
}
