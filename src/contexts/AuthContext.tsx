import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const format = (err: any) => {
      if (!err) return null;
      const message = err.message ?? err.msg ?? err.error_description ?? null;
      const code = err.code ?? err.error_code ?? err.name ?? null;
      if (message && code) return `${message} (${code})`;
      if (message) return message;
      if (code) return String(code);
      return String(err);
    };

    const formatted = format(error);
    if (error) {
      toast({
        title: 'Login Failed',
        description: formatted ?? String(error),
        variant: 'destructive',
      });
      return { error };
    }

    // Update local auth state immediately when sign in succeeds
    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);

    toast({
      title: 'Signed in',
      description: 'Welcome back!',
    });

    return { error: null, data };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    const format = (err: any) => {
      if (!err) return null;
      const message = err.message ?? err.msg ?? err.error_description ?? null;
      const code = err.code ?? err.error_code ?? err.name ?? null;
      if (message && code) return `${message} (${code})`;
      if (message) return message;
      if (code) return String(code);
      return String(err);
    };

    const formatted = format(error);
    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: formatted ?? String(error),
        variant: 'destructive',
      });
      return { error };
    }

    // If signUp returns a session (depends on Supabase settings), update state
    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);

    toast({
      title: 'Check your email',
      description: 'Please check your email for verification link',
    });

    return { error: null, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear local state immediately
    setUser(null);
    setSession(null);

    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    const format = (err: any) => {
      if (!err) return null;
      const message = err.message ?? err.msg ?? err.error_description ?? null;
      const code = err.code ?? err.error_code ?? err.name ?? null;
      if (message && code) return `${message} (${code})`;
      if (message) return message;
      if (code) return String(code);
      return String(err);
    };

    const formatted = format(error);
    if (error) {
      toast({
        title: 'Reset Failed',
        description: formatted ?? String(error),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Check your email',
        description: 'Password reset link has been sent to your email',
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};