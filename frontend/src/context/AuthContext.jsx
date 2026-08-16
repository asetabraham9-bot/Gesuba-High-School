import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  clearSession,
  dashboardPathForRole,
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
  registerRequest
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const me = await fetchCurrentUser();
        if (!cancelled) setUser(me);
      } catch {
        clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { user: next } = await loginRequest(identifier, password);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (data) => {
    return registerRequest(data);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      dashboardPath: dashboardPathForRole(user?.role)
    }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
