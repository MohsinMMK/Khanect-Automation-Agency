import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

/**
 * Hook to access authentication state and methods
 * 
 * @example
 * const { user, client, login, logout, isLoading, isAuthenticated } = useAuth();
 * 
 * // Login
 * const result = await login(email, password);
 * if (!result.success) {
 *   console.error(result.error);
 * }
 * 
 * // Logout
 * await logout();
 * 
 * // Check auth status
 * if (isAuthenticated) {
 *   console.log(`Welcome, ${client.full_name}`);
 * }
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
