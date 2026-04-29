import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherSlots from "./pages/teacher/Slots";
import StudentDashboard from "./pages/student/Dashboard";
import StudentBookings from "./pages/student/Bookings";
import Layout from "./components/Layout";

const ProtectedRoute = ({ children, role }) => {
  const { user, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center animate-pulse">
            <span className="text-white font-display font-bold text-lg">S</span>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (dbUser && role && dbUser.role !== role) {
    return <Navigate to={dbUser.role === "teacher" ? "/teacher" : "/student"} replace />;
  }

  return children;
};

export default function App() {
  const { user, dbUser, loading } = useAuth();

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={dbUser?.role === "teacher" ? "/teacher" : "/student"} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={dbUser?.role === "teacher" ? "/teacher" : "/student"} />} />

        <Route path="/teacher" element={
          <ProtectedRoute role="teacher">
            <Layout role="teacher" />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="slots" element={<TeacherSlots />} />
        </Route>

        <Route path="/student" element={
          <ProtectedRoute role="student">
            <Layout role="student" />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="bookings" element={<StudentBookings />} />
        </Route>

        <Route path="*" element={
          user
            ? <Navigate to={dbUser?.role === "teacher" ? "/teacher" : "/student"} />
            : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
}
