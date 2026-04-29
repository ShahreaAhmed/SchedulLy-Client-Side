import { useEffect, useState } from "react";
import api from "../../config/api";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";

const today = new Date().toISOString().split("T")[0];

export default function TeacherSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: "", startTime: "", subject: "" });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all"); // all | available | booked

  const fetchSlots = async () => {
    try {
      const res = await api.get("/api/slots/my");
      setSlots(res.data);
    } catch {
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.date || !form.startTime) return toast.error("Date and time are required");
    setCreating(true);
    try {
      const res = await api.post("/api/slots", form);
      setSlots(prev => [...prev, res.data].sort((a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
      ));
      setForm({ date: "", startTime: "", subject: "" });
      toast.success("Slot created successfully! ✅");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create slot");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await api.delete(`/api/slots/${id}`);
      setSlots(prev => prev.filter(s => s._id !== id));
      toast.success("Slot deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot delete slot");
    }
  };

  const filtered = filter === "all" ? slots
    : slots.filter(s => s.status === filter);

  const groupedByDate = filtered.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">My Slots</h1>
        <p className="text-gray-500">Create and manage your 15-minute teaching slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Slot Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-gray-900">Create New Slot</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Select Date</label>
                <input type="date" className="input" min={today}
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Start Time</label>
                <input type="time" className="input"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required />
                <p className="text-xs text-gray-400 mt-1">Duration: 15 minutes (fixed)</p>
              </div>
              <div>
                <label className="label">Subject / Topic (optional)</label>
                <input className="input" placeholder="e.g. Calculus Review"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={creating}>
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating...
                  </span>
                ) : "Generate Slot"}
              </button>
            </form>

            {/* Info */}
            <div className="mt-5 p-3 bg-primary-50 rounded-xl border border-primary-100">
              <p className="text-xs text-primary-600 font-medium">💡 Rules</p>
              <ul className="mt-1.5 space-y-1 text-xs text-primary-500">
                <li>• All slots are exactly 15 minutes</li>
                <li>• Past times cannot be added</li>
                <li>• No overlapping slots allowed</li>
                <li>• Booked slots cannot be deleted</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Slots List */}
        <div className="lg:col-span-2">
          {/* Filter */}
          <div className="flex gap-2 mb-5">
            {["all", "available", "booked"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all
                  ${filter === f ? "bg-primary-500 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:border-primary-300"}`}>
                {f === "all" ? `All (${slots.length})` : f === "available"
                  ? `Available (${slots.filter(s=>s.status==="available").length})`
                  : `Booked (${slots.filter(s=>s.status==="booked").length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : Object.keys(groupedByDate).length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="font-semibold text-gray-600">No slots found</p>
              <p className="text-gray-400 text-sm mt-1">Create your first slot using the form</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, daySlots]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-sm font-bold text-gray-700">
                        {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-400">{daySlots.length} slot{daySlots.length>1?"s":""}</span>
                    </div>
                    <div className="space-y-2">
                      {daySlots.map(slot => (
                        <div key={slot._id}
                          className="flex items-center gap-4 bg-white border border-gray-100 hover:border-primary-100 rounded-2xl px-5 py-4 transition-all group shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-800">
                                {slot.startTime} – {slot.endTime}
                              </span>
                              <span className={slot.status === "available" ? "badge-available" : "badge-booked"}>
                                <span className={`w-1.5 h-1.5 rounded-full ${slot.status==="available"?"bg-emerald-500":"bg-orange-500"}`} />
                                {slot.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {slot.subject || "No subject"}{" "}
                              {slot.bookedByName && (
                                <span className="text-orange-500">• Student: {slot.bookedByName}</span>
                              )}
                            </div>
                          </div>
                          {slot.status === "available" && (
                            <button onClick={() => handleDelete(slot._id)}
                              className="opacity-0 group-hover:opacity-100 btn-danger text-xs py-1.5 px-3">
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
