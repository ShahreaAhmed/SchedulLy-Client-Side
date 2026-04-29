import { useEffect, useState } from "react";
import api from "../../config/api";
import toast from "react-hot-toast";
import { format, parseISO, isPast } from "date-fns";

export default function StudentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api.get("/api/slots/my-bookings")
      .then(r => setBookings(r.data))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      await api.post(`/api/slots/${id}/cancel`);
      setBookings(prev => prev.filter(b => b._id !== id));
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = bookings.filter(b => !isPast(new Date(`${b.date}T${b.endTime}:00`)));
  const past = bookings.filter(b => isPast(new Date(`${b.date}T${b.endTime}:00`)));

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">My Bookings</h1>
        <p className="text-gray-500">Your scheduled and past sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: bookings.length, icon: "📋" },
          { label: "Upcoming", value: upcoming.length, icon: "⏰" },
          { label: "Completed", value: past.length, icon: "✅" },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-2xl font-display font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold text-gray-600 text-lg">No bookings yet</p>
          <p className="text-gray-400 text-sm mt-1">Browse available sessions and book your first slot</p>
          <a href="/student" className="btn-primary inline-block mt-4 text-sm">Discover Sessions</a>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 dot-pulse" />
                Upcoming Sessions
              </h2>
              <div className="space-y-3">
                {upcoming
                  .sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                  .map(b => (
                  <BookingCard key={b._id} booking={b} cancelling={cancellingId === b._id}
                    onCancel={() => handleCancel(b._id)} showCancel />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-gray-500 mb-4">Past Sessions</h2>
              <div className="space-y-3">
                {past
                  .sort((a,b) => b.date.localeCompare(a.date))
                  .map(b => (
                  <BookingCard key={b._id} booking={b} past />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, showCancel, cancelling, onCancel, past }) {
  const initial = booking.teacherName?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  return (
    <div className={`flex items-center gap-5 bg-white border rounded-2xl px-6 py-4 shadow-sm transition-all
      ${past ? "opacity-60 border-gray-100" : "border-primary-50 hover:border-primary-100 hover:shadow-card"}`}>
      <div className="w-14 h-14 bg-primary-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-primary-100">
        <div className="text-[10px] text-primary-400 uppercase font-bold leading-none">
          {format(parseISO(booking.date), "MMM")}
        </div>
        <div className="text-xl font-display font-bold text-primary-600 leading-none">
          {format(parseISO(booking.date), "dd")}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800">{booking.teacherName}</div>
        <div className="text-sm text-gray-500 mt-0.5">
          {booking.startTime} – {booking.endTime}
          {booking.subject && <span className="text-primary-500 ml-1">· {booking.subject}</span>}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {format(parseISO(booking.date), "EEEE, MMMM d, yyyy")}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {past ? (
          <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full border border-gray-100">
            ✓ Completed
          </span>
        ) : (
          <>
            <span className="badge-available">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dot-pulse" />
              Confirmed
            </span>
            {showCancel && (
              <button onClick={onCancel} disabled={cancelling}
                className="btn-danger text-xs py-1.5 px-3">
                {cancelling ? "..." : "Cancel"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
