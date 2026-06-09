import type { IUser, AssignableRole, CreateUserRequest, UpdateUserRequest } from '../../../types.js';

interface StoredUser extends IUser {
  passwordHash: string;
}

const passwordStore = new Map<string, string>();

function simpleHash(password: string): string {
  return Buffer.from(password).toString('base64');
}

const store: StoredUser[] = [
  {
    id: 'usr-001',
    email: 'user@drivewise.co.il',
    phone: '050-1234567',
    firstName: 'יואב',
    lastName: 'כהן',
    role: 'USER',
    createdAt: '2025-09-12T08:00:00.000Z',
    isBanned: false,
    passwordHash: simpleHash('user123'),
  },
  {
    id: 'usr-002',
    email: 'admin@drivewise.co.il',
    phone: '052-9876543',
    firstName: 'נועה',
    lastName: 'לוי',
    role: 'ADMIN',
    createdAt: '2025-06-01T10:00:00.000Z',
    isBanned: false,
    passwordHash: simpleHash('admin123'),
  },
];

store.forEach((u) => passwordStore.set(u.email, u.passwordHash));

export function verifyPassword(email: string, password: string): boolean {
  const hash = passwordStore.get(email);
  return hash === simpleHash(password);
}

export function findUserByEmail(email: string): IUser | undefined {
  const u = store.find((x) => x.email.toLowerCase() === email.toLowerCase());
  return u ? toPublic(u) : undefined;
}

export function findUserByPhone(phone: string): IUser | undefined {
  const normalized = phone.replace(/\D/g, '');
  const u = store.find((x) => x.phone.replace(/\D/g, '') === normalized);
  return u ? toPublic(u) : undefined;
}

export function findUserById(id: string): IUser | undefined {
  const u = store.find((x) => x.id === id);
  return u ? toPublic(u) : undefined;
}

export function listUsers(): IUser[] {
  return store.map(toPublic);
}

export function registerUser(data: CreateUserRequest): IUser {
  if (findUserByEmail(data.email)) {
    throw new Error('כתובת האימייל כבר רשומה במערכת');
  }
  const id = `usr-${Date.now()}`;
  const hash = simpleHash(data.password);
  const user: StoredUser = {
    id,
    email: data.email.toLowerCase(),
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role ?? 'USER',
    createdAt: new Date().toISOString(),
    isBanned: false,
    passwordHash: hash,
  };
  store.push(user);
  passwordStore.set(user.email, hash);
  return toPublic(user);
}

export function createUserByAdmin(data: CreateUserRequest): IUser {
  return registerUser(data);
}

export function updateUser(id: string, data: UpdateUserRequest): IUser {
  const idx = store.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('המשתמש לא נמצא');

  if (data.email && data.email !== store[idx].email) {
    if (findUserByEmail(data.email)) throw new Error('כתובת האימייל כבר בשימוש');
    passwordStore.delete(store[idx].email);
    store[idx].email = data.email.toLowerCase();
    passwordStore.set(store[idx].email, store[idx].passwordHash);
  }

  if (data.firstName) store[idx].firstName = data.firstName;
  if (data.lastName) store[idx].lastName = data.lastName;
  if (data.phone) store[idx].phone = data.phone;
  if (data.role) store[idx].role = data.role;
  if (typeof data.isBanned === 'boolean') store[idx].isBanned = data.isBanned;
  if (data.password) {
    store[idx].passwordHash = simpleHash(data.password);
    passwordStore.set(store[idx].email, store[idx].passwordHash);
  }

  return toPublic(store[idx]);
}

export function authenticateIdentifier(identifier: string, password: string): IUser | null {
  const byEmail = findUserByEmail(identifier);
  if (byEmail && verifyPassword(byEmail.email, password)) return byEmail;

  const byPhone = findUserByPhone(identifier);
  if (byPhone && verifyPassword(byPhone.email, password)) return byPhone;

  return null;
}

function toPublic(u: StoredUser): IUser {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    createdAt: u.createdAt,
    isBanned: u.isBanned,
  };
}
