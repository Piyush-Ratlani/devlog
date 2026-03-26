import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../lib/axios";
import type { ReactNode } from "react";
import type { User } from "@devlog/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: Boolean;
  isLoading: Boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // ── Initialize from localStorage ────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Verify token is still valid, get fresh user data
    api
      .get("/api/auth/me")
      .then(res => {
        setState({
          user: res.data.data.user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      });
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { accessToken, user } = res.data.data;

    localStorage.setItem("accessToken", accessToken);

    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
  }, []);

  // ── Register ─────────────────────────────────────────────────────
  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      const { accessToken, user } = res.data.data;

      localStorage.setItem("accessToken", accessToken);

      setState({ user, accessToken, isAuthenticated: true, isLoading: false });
    },
    [],
  );

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
