import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const TeacherNav = () => (
  <nav className="space-y-1">
    <NavLink to="/teacher" end className={({ isActive }) => isActive ? "sidebar-link-active" : "sidebar-link"}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Dashboard
    </NavLink>
    <NavLink to="/teacher/slots" className={({ isActive }) => isActive ? "sidebar-link-active" : "sidebar-link"}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      My Slots
    </NavLink>
  </nav>
);

const StudentNav = () => (
  <nav className="space-y-1">
    <NavLink to="/student" end className={({ isActive }) => isActive ? "sidebar-link-active" : "sidebar-link"}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Dashboard
    </NavLink>
    <NavLink to="/student/bookings" className={({ isActive }) => isActive ? "sidebar-link-active" : "sidebar-link"}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      My Bookings
    </NavLink>
  </nav>
);

export default function Layout({ role }) {
  const { dbUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = dbUser?.displayName
    ? dbUser.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex min-h-screen bg-[#f7f5ff]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-primary-50 flex flex-col shadow-sm fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-primary-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center shadow-md">
              <span className="text-white font-display font-bold text-sm">S</span>
            </div>
            <div>
              <span className="font-display font-bold text-primary-700 text-lg leading-none">Schedulify</span>
              <div className="text-[10px] text-primary-400 font-medium uppercase tracking-widest">
                {role === "teacher" ? "Education Admin" : "Student Portal"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-5">
          {role === "teacher" ? <TeacherNav /> : <StudentNav />}
        </div>

        {/* Pro tip */}
        <div className="mx-4 mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
          <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Pro Tip</div>
          <p className="text-xs text-primary-600 leading-relaxed">
            {role === "teacher"
              ? "Blocking consecutive 15-min slots increases booking rates by 40%."
              : "Book early — popular slots fill up fast!"}
          </p>
        </div>

        {/* User + Logout */}
        <div className="px-4 pb-5 border-t border-primary-50 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow">
              {dbUser?.photoURL ? (
                <img src={dbUser.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{dbUser?.displayName || "User"}</div>
              <div className="text-[11px] text-gray-400 capitalize">{dbUser?.subject || dbUser?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
