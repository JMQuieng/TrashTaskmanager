import { loadUsers, saveUsers } from "./storage";
import { isValidEmail, isValidPassword } from "./validation";
import { User } from "../types";
import * as crypto from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function registerUser(input: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
}): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const { first_name, last_name, email, password, confirm } = input;

  if (!isValidEmail(email))
    return { ok: false, error: "Invalid email format." };
  if (!isValidPassword(password))
    return {
      ok: false,
      error: "Password must be ≥5 chars, include number & special.",
    };
  if (password !== confirm)
    return { ok: false, error: "Passwords do not match." };

  const users = await loadUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase()))
    return { ok: false, error: "Email already exists." };

  const hash = await crypto.hash(password, 10);
  const now = new Date().toISOString();

  const newUser: User = {
    id: uuidv4(),
    first_name,
    last_name,
    email: email.trim(),
    password_hash: hash,
    created_date: now,
    updated_date: now,
    events: [],
  };

  const next = [...users, newUser];
  await saveUsers(next);
  return { ok: true, user: newUser };
}

export async function loginUser(email: string, password: string) {
  const users = await loadUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false as const, error: "Invalid credentials." };
  const ok = await crypto.compare(password, user.password_hash);
  if (!ok) return { ok: false as const, error: "Invalid credentials." };
  return { ok: true as const, user };
}

export async function updateUser(userId: string, patch: Partial<User>) {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { ok: false as const, error: "User not found." };

  // email uniqueness check if changed
  if (patch.email && patch.email !== users[idx].email) {
    if (!isValidEmail(patch.email))
      return { ok: false as const, error: "Invalid email format." };
    if (users.some((u) => u.email.toLowerCase() === patch.email!.toLowerCase()))
      return { ok: false as const, error: "Email already exists." };
  }

  // password change if provided as plain text (Settings will handle confirm/validation)
  if ((patch as any).password) {
    const pw = (patch as any).password as string;
    const hash = await crypto.hash(pw, 10);
    (patch as any).password_hash = hash;
    delete (patch as any).password;
  }

  const updated = {
    ...users[idx],
    ...patch,
    updated_date: new Date().toISOString(),
  };
  users[idx] = updated;
  await saveUsers(users);
  return { ok: true as const, user: updated };
}
