import { loadUsers, saveUsers } from "./storage";
import { User } from "../types";

export async function getUser(userId: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find((u) => u.id === userId) ?? null;
}
