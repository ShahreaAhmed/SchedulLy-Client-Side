import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "student", subject: "",
  });
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      const user = await registerWithEmail(
        form.email, form.password, form.name, form.role, form.subject
      );
      toast.success(`Account created! Welcome, ${user?.displayName || form.name}!`);
      navigate(user?.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      toast.error(err.message?.includes("email-already-in-use")
        ? "Email already registered" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(form.role, form.subject);
      toast.success(`Welcome, ${user?.displayName}!`);
      navigate(user?.role === "teacher" ? "/teacher" : "/student");
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f5ff] p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-md">
              <span className="text-white font-display font-bold">S</span>
            </div>
            <span className="font-display font-bold text-primary-700 text-xl">Schedulify</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-gray-500 text-sm">Join thousands of learners and educators</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-primary-100 mb-6 shadow-sm">
          {["student", "teacher"].map(r => (
            <button key={r} type="button"
              onClick={() => setForm(f => ({ ...f, role: r }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200
                ${form.role === r
                  ? "bg-primary-500 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700"}`}>
              {r === "student" ? "🎓 Student" : "👨‍🏫 Teacher"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Alex Rivera" value={form.name} onChange={set("name")} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          </div>
          {form.role === "teacher" && (
            <div>
              <label className="label">Subject / Specialization</label>
              <input className="input" placeholder="e.g. Advanced Mathematics" value={form.subject} onChange={set("subject")} />
            </div>
          )}
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••" value={form.password} onChange={set("password")} required />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input" placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")} required />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3 w-fit mx-auto">
              or
            </div>
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google as {form.role}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
