import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";

export default function StudentDashboard() {
  const { dbUser } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/slots/available")
      .then(r => setSlots(r.data))
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (slotId) => {
    setBookingId(slotId);
    try {
      await api.post(`/api/slots/${slotId}/book`);
      setSlots(prev => prev.filter(s => s._id !== slotId));
      toast.success("Session booked successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingId(null);
    }
  };

  const filtered = slots.filter(s => {
    const q = search.toLowerCase();
    return !q || s.teacherName?.toLowerCase().includes(q) || s.subject?.toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary-400 dot-pulse" />
            <span className="text-xs text-primary-500 font-semibold uppercase tracking-widest">Student</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Welcome back, {dbUser?.displayName?.split(" ")[0]} 🎓
          </h1>
          <p className="text-gray-500 mt-1">Browse and book available sessions</p>
        </div>
        <a href="/student/bookings"
          className="btn-secondary text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          My Bookings
        </a>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input className="input pl-10 bg-white" placeholder="Search by teacher name or subject..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Available Slots Count */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-display font-bold text-gray-700">
          {filtered.length} Available Slot{filtered.length !== 1 ? "s" : ""}
        </span>
        {search && (
          <button onClick={() => setSearch("")} className="text-xs text-gray-400 hover:text-gray-600">
            Clear search ×
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold text-gray-600 text-lg">No available slots</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try a different search" : "Check back later for new sessions"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, daySlots]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-xl">
                    {format(parseISO(date), "MMM dd")}
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {format(parseISO(date), "EEEE, MMMM d")}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {daySlots.map(slot => (
                    <SlotCard key={slot._id} slot={slot}
                      booking={bookingId === slot._id}
                      onBook={() => handleBook(slot._id)} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function SlotCard({ slot, booking, onBook }) {
  const initial = slot.teacherName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  const colors = ["bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-orange-100 text-orange-700"];
  const colorIdx = slot.teacherName?.charCodeAt(0) % colors.length || 0;

  return (
    <div className="card-hover flex items-center gap-4 cursor-default animate-scale-in">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${colors[colorIdx]}`}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 text-sm truncate">{slot.teacherName}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {slot.startTime} – {slot.endTime}
          {slot.subject && <span className="text-primary-500"> · {slot.subject}</span>}
        </div>
      </div>
      <button onClick={onBook} disabled={booking}
        className="btn-primary text-xs px-4 py-2 flex-shrink-0">
        {booking ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : "Book Now"}
      </button>
    </div>
  );
}
