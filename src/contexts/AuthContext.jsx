import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // True while the user is in a Supabase password-recovery session (clicked a
  // reset link). Used to force-route them to /reset-password even if Supabase
  // lands them on another page (e.g. the Site URL / landing page).
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
      } catch (err) {
        
        console.error('Error getting session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Fired when the user arrives via a password-reset link (token parsed
      // from the URL). Flag it so the app can route them to the reset form.
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password (with retry for network errors)
  const signIn = async (email, password, retryCount = 0) => {
    const MAX_RETRIES = 2;

    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const isNetworkError = err.message?.toLowerCase().includes('fetch') || 
                             err.message?.toLowerCase().includes('network') ||
                             err.name === 'TypeError';

      // Retry on network errors
      if (isNetworkError && retryCount < MAX_RETRIES) {
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return signIn(email, password, retryCount + 1);
      }
      
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setPasswordRecovery(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Request password reset
  const resetPassword = async (email) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Update password (after clicking reset link)
  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      // Recovery complete — clear the flag so the recovery gate stops
      // redirecting the user back to /reset-password.
      setPasswordRecovery(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  };

  // Get user progress from Supabase
  const getProgress = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (first time user)
        throw error;
      }
      
      return data;
    } catch (err) {
      console.error('Error getting progress:', err);
      return null;
    }
  }, [user]);

  // Record a login (atomic increment) and return the user's NEW login count.
  // Used to schedule the DFY upsell popup on the dashboard.
  const recordLogin = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('increment_login_count', {
        p_user_id: user.id,
      });
      if (error) throw error;
      return typeof data === 'number' ? data : null;
    } catch (err) {
      console.error('Error recording login:', err);
      return null;
    }
  }, [user]);

  // Save user progress to Supabase
  const saveProgress = useCallback(async (completedLessons, currentLesson) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          completed_lessons: completedLessons,
          current_lesson: currentLesson,
          last_accessed: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving progress:', err);
      return null;
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getProgress,
    saveProgress,
    recordLogin,
    passwordRecovery,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

