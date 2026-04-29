import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import api from "../config/api";
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const syncUser = async (role = null, subject = "", displayName = "") => {
    try {
      const body = {};
      if (role) body.role = role;
      if (subject) body.subject = subject;
      if (displayName) body.displayName = displayName;
      const res = await api.post("/api/users/sync", body);
      setDbUser(res.data);
      return res.data;
    } catch (err) {
      console.error("Sync error:", err.response?.data || err.message);
      return null;
    }
  };
 
  const fetchDbUser = async () => {
    try {
      const res = await api.get("/api/users/me");
      setDbUser(res.data);
      return res.data;
    } catch {
      return null;
    }
  };
 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await firebaseUser.getIdToken(true);
        await fetchDbUser();
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);
 
  const loginWithGoogle = async (role, subject = "") => {
    const result = await signInWithPopup(auth, googleProvider);
    await result.user.getIdToken(true);
    const synced = await syncUser(role, subject);
    return synced;
  };
 
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await result.user.getIdToken(true);
    const dbUserData = await fetchDbUser();
    return dbUserData;
  };
 
  const registerWithEmail = async (email, password, displayName, role, subject = "") => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await result.user.getIdToken(true);
    const synced = await syncUser(role, subject, displayName);
    return synced;
  };
 
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setDbUser(null);
  };
 
  return (
    <AuthContext.Provider
      value={{ user, dbUser, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout, syncUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);