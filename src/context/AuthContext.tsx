import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/auth';
import { socketService } from '@/services/socket';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await authService.getMe();
        setUser(user);
        socketService.connect(user._id);
      } catch {
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  // Set up socket listeners when user changes
  useEffect(() => {
    if (user) {
      socketService.onHired((data) => {
        toast.success(`🎉 You have been hired for "${data.gigTitle}"!`);
      });
    }

    return () => {
      socketService.offHired();
    };
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user } = await authService.login({ email, password });
      setUser(user);
      console.log(user)
      socketService.connect(user._id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user } = await authService.register({ name, email, password });
      setUser(user);
      socketService.connect(user._id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      socketService.disconnect();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitialized, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
