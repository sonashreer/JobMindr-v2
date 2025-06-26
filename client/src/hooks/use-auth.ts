import { useState } from 'react';

interface User {
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is already logged in on initialization
    const savedUser = localStorage.getItem('jobmindr_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('jobmindr_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jobmindr_user');
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
