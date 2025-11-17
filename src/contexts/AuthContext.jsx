import React, { createContext, useState, useEffect, useContext } from 'react';
import { chatAuth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext(null);

function isTokenExpired(token) {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [auth, setAuth] = useState({
    isAuthenticated: localStorage.getItem('token') ? !isTokenExpired(localStorage.getItem('token')) : false,
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')) || null
  });

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuth({ isAuthenticated: true, token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth({ isAuthenticated: false, token: null, user: null });
    chatAuth.signOut().then(() => {
      console.log('User signed out');
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(chatAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (!user) {
        logout();
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, currentUser, loading }}>
      {!loading ? children : <p>Loading...</p>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
