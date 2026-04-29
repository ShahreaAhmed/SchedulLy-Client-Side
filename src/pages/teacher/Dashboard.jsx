import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import { format, parseISO } from "date-fns";

const StatCard = ({ icon, label, value, color }) => (
  <div className={`card flex items-center gap-4 ${color}`}>
    <div className="w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center text-2xl flex-shrink-0">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-display font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);

export default function TeacherDashboard() {
  const { dbUser } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/slots/my").then(r => {
      setSlots(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = slots.length;
  const available = slots.filter(s => s.status === "available").length;
  const booked = slots.filter(s => s.status === "booked").length;

  const upcoming = slots
    .filter(s => {
      const d = new Date(`${s.date}T${s.startTime}:00`);
      return d >= new Date();
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 5);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 dot-pulse" />
          <span className="text-xs text-emerald-600 font-semibold uppercase tracking-widest">Teacher</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900">
          Welcome back, {dbUser?.displayName?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {dbUser?.subject && <span className="font-medium text-primary-600">{dbUser.subject} • </span>}
          Here's your teaching overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="📅" label="Total Slots Created" value={total} color="text-primary-500" />
        <StatCard icon="✅" label="Available Slots" value={available} color="text-emerald-500" />
        <StatCard icon="🎓" label="Booked Sessions" value={booked} color="text-orange-500" />
      </div>

      {/* Upcoming sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-gray-900">Upcoming Schedule</h2>
          <a href="/teacher/slots" className="text-sm text-primary-600 font-semibold hover:underline">View All →</a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500 font-medium">No upcoming slots</p>
            <p className="text-gray-400 text-sm mt-1">Create your first slot to get started</p>
            <a href="/teacher/slots" className="btn-primary inline-block mt-4 text-sm">
              + Create Slot
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(slot => (
              <div key={slot._id}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary-50/50 rounded-2xl transition-colors group">
                <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border border-primary-50 flex-shrink-0">
                  <div className="text-[10px] text-gray-400 uppercase font-bold leading-none">
                    {format(parseISO(slot.date), "MMM")}
                  </div>
                  <div className="text-lg font-display font-bold text-primary-600 leading-none">
                    {format(parseISO(slot.date), "dd")}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">
                    {slot.startTime} – {slot.endTime}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {slot.subject || "General Session"} •{" "}
                    {slot.status === "booked"
                      ? <span className="text-orange-600 font-medium">Booked by {slot.bookedByName}</span>
                      : <span className="text-emerald-600 font-medium">Available</span>
                    }
                  </div>
                </div>
                <span className={slot.status === "available" ? "badge-available" : "badge-booked"}>
                  <span className={`w-1.5 h-1.5 rounded-full ${slot.status === "available" ? "bg-emerald-500" : "bg-orange-500"}`} />
                  {slot.status === "available" ? "Available" : "Booked"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
