import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { addUserPurchase, getCurrentUser, loginUser, logoutUser, registerUser, removeUserPurchase, type AppUser } from '../services/api';

export type Role = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  purchases: string[];
}

interface AuthCtx {
  user: AuthUser | null;
  ready: boolean;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string, role: Role): Promise<void>;
  logout(): Promise<void>;
  addPurchase(productName: string): Promise<void>;
  removePurchase(productName: string): Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function normalizeUser(user: AppUser): AuthUser {
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((current) => setUser(current ? normalizeUser(current) : null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  function persist(u: AuthUser) {
    setUser(u);
  }

  async function login(email: string, password: string) {
    const found = await loginUser(email, password);
    persist(normalizeUser(found));
  }

  async function register(name: string, email: string, password: string, role: Role) {
    const created = await registerUser(name, email, password, role);
    persist(normalizeUser(created));
  }

  async function logout() {
    await logoutUser().catch(() => {});
    setUser(null);
  }

  async function addPurchase(productName: string) {
    if (!user) return;
    const updated = normalizeUser(await addUserPurchase(user.id, productName));
    persist(updated);
  }

  async function removePurchase(productName: string) {
    if (!user) return;
    const updated = normalizeUser(await removeUserPurchase(user.id, productName));
    persist(updated);
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
