import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  purchases: string[];
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login(email: string, password: string): void;
  register(name: string, email: string, password: string, role: Role): void;
  logout(): void;
  addPurchase(productName: string): void;
  removePurchase(productName: string): void;
}

const Ctx = createContext<AuthCtx | null>(null);

const USERS_KEY = 'bb_users';
const SESSION_KEY = 'bb_session';

const SEED_USERS: StoredUser[] = [
  { id: 'admin-1', name: 'Admin', email: 'admin@biznesbayt.az', password: 'admin123', role: 'admin', purchases: [] },
  { id: 'user-1',  name: 'Test İstifadəçi', email: 'user@test.az', password: 'user123', role: 'user', purchases: [] },
];

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(u: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = getUsers();
    const merged = [...existing];
    for (const s of SEED_USERS) {
      if (!existing.find(u => u.email === s.email)) merged.push(s);
    }
    saveUsers(merged);
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setUser(JSON.parse(s));
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  function persist(u: AuthUser) {
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  }

  function login(email: string, password: string) {
    const found = getUsers().find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Email və ya şifrə yanlışdır');
    const { password: _p, ...clean } = found;
    persist(clean);
  }

  function register(name: string, email: string, password: string, role: Role) {
    const users = getUsers();
    if (users.find(u => u.email === email)) throw new Error('Bu email artıq qeydiyyatdadır');
    const nu: StoredUser = { id: `u-${Date.now()}`, name, email, password, role, purchases: [] };
    saveUsers([...users, nu]);
    const { password: _p, ...clean } = nu;
    persist(clean);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  function addPurchase(productName: string) {
    if (!user) return;
    const updated = { ...user, purchases: [...new Set([...user.purchases, productName])] };
    persist(updated);
    saveUsers(getUsers().map(u => u.id === updated.id ? { ...u, purchases: updated.purchases } : u));
  }

  function removePurchase(productName: string) {
    if (!user) return;
    const updated = { ...user, purchases: user.purchases.filter(p => p !== productName) };
    persist(updated);
    saveUsers(getUsers().map(u => u.id === updated.id ? { ...u, purchases: updated.purchases } : u));
  }

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout, addPurchase, removePurchase }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
