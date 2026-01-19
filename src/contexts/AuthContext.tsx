import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Client } from '@/types/portal';

export interface AuthContextType {
  user: User | null;
  client: Client | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshClient: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch client data from clients table
  const fetchClientData = useCallback(async (userId: string): Promise<Client | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching client data:', error);
        return null;
      }

      if (!data) {
        console.error('No client record found for user');
        return null;
      }

      // Check if client status is active
      if (data.status !== 'active') {
        console.error(`Client account is ${data.status}`);
        return null;
      }

      return data as Client;
    } catch (err) {
      console.error('Unexpected error fetching client:', err);
      return null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const clientData = await fetchClientData(session.user.id);
        setClient(clientData);
        
        // If no valid client, sign out
        if (!clientData) {
          await supabase.auth.signOut();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const clientData = await fetchClientData(session.user.id);
        setClient(clientData);
      } else {
        setClient(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchClientData]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Authentication service unavailable' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const clientData = await fetchClientData(data.user.id);
        
        if (!clientData) {
          await supabase.auth.signOut();
          return { success: false, error: 'Your account is not active or not found. Please contact support.' };
        }
        
        setClient(clientData);
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (err) {
      console.error('Unexpected login error:', err);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  }, [fetchClientData]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setClient(null);
  }, []);

  // Password reset function
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: 'Authentication service unavailable' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: 'Failed to send reset email. Please try again.' };
    }
  }, []);

  // Refresh client data
  const refreshClient = useCallback(async (): Promise<void> => {
    if (user) {
      const clientData = await fetchClientData(user.id);
      setClient(clientData);
    }
  }, [user, fetchClientData]);

  const value: AuthContextType = {
    user,
    client,
    isLoading,
    isAuthenticated: !!user && !!client,
    login,
    logout,
    resetPassword,
    refreshClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
