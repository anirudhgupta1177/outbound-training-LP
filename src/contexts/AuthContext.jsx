import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// #region agent log
const debugLog = (location, message, data) => {
  fetch('http://127.0.0.1:7242/ingest/a3ca0b1c-20f2-45d3-8836-7eac2fdb4cb3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),runId:'auth-debug'})}).catch(()=>{});
};
// #endregion

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

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      // #region agent log
      debugLog('AuthContext:getSession', 'Checking session on mount', { hypothesisId: 'A-E' });
      // #endregion
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // #region agent log
        debugLog('AuthContext:getSession', 'Session check complete', { 
          hasSession: !!session,
          hypothesisId: 'A-E'
        });
        // #endregion
        
        setUser(session?.user ?? null);
      } catch (err) {
        // #region agent log
        debugLog('AuthContext:getSession', 'Session check failed', { 
          errorName: err.name,
          errorMessage: err.message,
          isNetworkError: err.message?.toLowerCase().includes('fetch'),
          hypothesisId: 'B-E'
        });
        // #endregion
        
        console.error('Error getting session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password (with retry for network errors)
  const signIn = async (email, password, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    // #region agent log
    debugLog('AuthContext:signIn', 'Login attempt started', { 
      emailDomain: email.split('@')[1],
      retryCount,
      hypothesisId: 'A-E'
    });
    // #endregion
    
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // #region agent log
      if (error) {
        debugLog('AuthContext:signIn', 'Supabase returned error', { 
          errorMessage: error.message,
          errorStatus: error.status,
          errorCode: error.code,
          retryCount,
          hypothesisId: 'A'
        });
      } else {
        debugLog('AuthContext:signIn', 'Login successful', { retryCount, hypothesisId: 'A-E' });
      }
      // #endregion
      
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const isNetworkError = err.message?.toLowerCase().includes('fetch') || 
                             err.message?.toLowerCase().includes('network') ||
                             err.name === 'TypeError';
      
      // #region agent log
      debugLog('AuthContext:signIn', 'Login catch block - exception thrown', { 
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack?.substring(0, 500),
        isNetworkError,
        retryCount,
        willRetry: isNetworkError && retryCount < MAX_RETRIES,
        hypothesisId: 'B-E'
      });
      // #endregion
      
      // Retry on network errors
      if (isNetworkError && retryCount < MAX_RETRIES) {
        // #region agent log
        debugLog('AuthContext:signIn', 'Retrying after network error', { 
          retryCount: retryCount + 1,
          delayMs: 1000 * (retryCount + 1),
          hypothesisId: 'E'
        });
        // #endregion
        
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

