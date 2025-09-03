import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'client' | 'admin' | 'agent' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No role found, default to client
          setUserRole('client');
        } else {
          throw error;
        }
      } else {
        setUserRole(data.role as UserRole);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          created_by: user?.id,
          is_active: true
        }, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;
      
      // Refresh user role if it's for current user
      if (userId === user?.id) {
        await fetchUserRole();
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const hasRole = (requiredRole: UserRole) => {
    return userRole === requiredRole;
  };

  const isAdmin = () => hasRole('admin');
  const isAgent = () => hasRole('agent');
  const isClient = () => hasRole('client');

  return {
    userRole,
    loading,
    error,
    fetchUserRole,
    assignRole,
    hasRole,
    isAdmin,
    isAgent,
    isClient
  };
};