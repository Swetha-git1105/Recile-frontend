import { createContext, useContext, useEffect, useState } from 'react';

import {
  login as apiLogin,
  logout as apiLogout,
  getToken,
} from '../services/api';

const AuthContext = createContext(null);
const USER_KEY = 'brainora_user';

// ==========================================
// LOAD SAVED USER
// ==========================================

function loadUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);

    return saved && getToken() ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  // api.js fires this event when the backend rejects the token (401).
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('brainora:unauthorized', onUnauthorized);
    return () =>
      window.removeEventListener('brainora:unauthorized', onUnauthorized);
  }, []);

  // ========================================
  // LOGIN
  // ========================================

  async function login(credentials) {
    const data = await apiLogin(credentials);
    console.log('COMPLETE LOGIN RESPONSE:', data);

    // Support different backend response formats.
    const institute =
      data?.campus ||
      data?.institute ||
      data?.college ||
      data?.collegeName ||
      data?.institutionName ||
      data?.institution ||
      data?.user?.campus ||
      data?.user?.institute ||
      data?.user?.college ||
      data?.user?.collegeName ||
      '';

    const u = {
      name: data?.name || data?.user?.name || '',
      email: data?.email || data?.user?.email || '',
      role: data?.role || data?.user?.role || '',

      // Store institute under one consistent property.
      campus: institute,

      mobile:
        data?.mobile ||
        data?.phone ||
        data?.user?.mobile ||
        data?.user?.phone ||
        '',

      profileImage:
        data?.profileImage ||
        data?.user?.profileImage ||
        '',
    };

    console.log('Logged-in user profile:', u);

    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);

    return u;
  }

  // ========================================
  // UPDATE PROFILE
  // ========================================

  function updateUser(updates) {
    setUser((current) => {
      if (!current) return current;

      const next = {
        ...current,
        name: updates.name ?? current.name,
        mobile: updates.mobile ?? current.mobile ?? '',
        profileImage:
          updates.profileImage ?? current.profileImage ?? '',
      };

      localStorage.setItem(USER_KEY, JSON.stringify(next));

      return next;
    });
  }

  // ========================================
  // LOGOUT
  // ========================================

  function logout() {
    apiLogout();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  // ========================================
  // CONTEXT
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// CUSTOM AUTH HOOK
// ==========================================

export function useAuth() {
  return useContext(AuthContext);
}