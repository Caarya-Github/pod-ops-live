'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { UserProfile } from '@/lib/types';

// Flag to prevent multiple redirects
let isRedirectingToLogin = false;

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLead: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLead: false,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Helper to decode JWT without verification
function decodeJWT(token: string): { phoneNumber?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLead, setIsLead] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      // Get token from localStorage (custom JWT from checkUser endpoint)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      // Decode token to get phone number
      const decoded = decodeJWT(token);
      const phoneNumber = decoded?.phoneNumber;
      if (!phoneNumber) {
        // Clear invalid token
        localStorage.removeItem('token');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_URL}/admin/allowed-users/${encodeURIComponent(phoneNumber)}`);

      // Check for authentication errors - avoid redirect loop on login page
      if (response.status === 401) {
        // Clear the invalid token
        localStorage.removeItem('token');
        if (typeof window !== 'undefined' && !isRedirectingToLogin && !window.location.pathname.includes('/login')) {
          isRedirectingToLogin = true;
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          window.location.href = '/login';
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const userData = data.data;
          // Transform to UserProfile format
          setUserProfile({
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            college: userData.college ? {
              _id: userData.college._id || userData.college,
              name: userData.college.name || 'Unknown',
              crew: userData.college.crew || '',
              isPod: userData.college.isPod || false,
            } : null,
            role: userData.role ? {
              _id: userData.role._id || '',
              name: userData.role.name || '',
              description: userData.role.description || '',
            } : null,
            rank: userData.rank ? {
              _id: userData.rank._id || '',
              name: userData.rank.name || '',
            } : null,
            isActive: userData.isActive,
            hasOnboarded: userData.hasOnboarded,
          });
          const roleName = userData.role?.name?.toLowerCase() || '';
          setIsLead(roleName.includes('lead'));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      setUser(user);
      if (user) {
        // Get the ID token
        const token = await user.getIdToken();
        // Set the token in a cookie
        document.cookie = `token=${token}; path=/; SameSite=Lax; max-age=86400;`;
        // Don't fetch user profile on login page
        if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
          setLoading(false);
          return;
        }
        // Fetch user profile using custom token from localStorage
        await fetchUserProfile();
      } else {
        // Clear the token cookie when user is not authenticated
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        setUserProfile(null);
        setIsLead(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      // Clear the token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isLead, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}