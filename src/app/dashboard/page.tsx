"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function Dashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingLeave, setEditingLeave] = useState<any>(null);

  const [leaveType, setLeaveType] = useState("full");
  const [halfDayType, setHalfDayType] = useState("first");
  const [reason, setReason] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [summary, setSummary] = useState<any>(null);

  const [details, setDetails] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  async function loadLeaves() {
    const res = await fetch("/api/leaves");
    const data = await res.json();

    const formatted = data.map((leave: any) => ({
      id: leave.id,
      title:
        leave.leave_type === "half"
          ? leave.half_day_type === "first"
            ? "First Half"
            : "Second Half"
          : "Full Day",
      start: leave.leave_date,
      allDay: true,
      backgroundColor: leave.status === "taken" ? "#4ade80" : "#facc15",
      textColor: "#000",
      extendedProps: leave,
    }));

    setEvents(formatted);
  }

  async function loadSummary() {
    let url = `/api/admin/summary?userId=me`;

    if (fromDate && toDate) {
      url += `&from=${fromDate}&to=${toDate}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setSummary(data);
  }

  async function loadDetails() {
    if (!fromDate || !toDate) return;

    const res = await fetch(`/api/leaves?from=${fromDate}&to=${toDate}`);

    const data = await res.json();
    setDetails(data);
    setShowDetails(true);
  }

  useEffect(() => {
    loadLeaves();
    loadSummary(); // 👈 load full summary initially
  }, []);

  function handleDateClick(info: any) {
    setEditingLeave(null);
    setSelectedDate(info.dateStr);
    setLeaveType("full");
    setHalfDayType("first");
    setReason("");
  }

  function handleEventClick(info: any) {
    const event = info.event;

    setEditingLeave({ id: event.id });
    setSelectedDate(event.startStr);
    setLeaveType(event.extendedProps.leave_type || "full");
    setHalfDayType(event.extendedProps.half_day_type || "first");
    setReason(event.extendedProps.reason || "");
  }

  async function saveLeave() {
    await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        leaveType,
        halfDayType,
        reason,
      }),
    });

    closeModal();
    await loadLeaves();
  }

  async function deleteLeave() {
    if (!editingLeave) return;

    await fetch("/api/leaves", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingLeave.id }),
    });

    closeModal();
    await loadLeaves();
  }

  function closeModal() {
    setSelectedDate(null);
    setEditingLeave(null);
  }

  return (
    <div className="my-6 mx-10 space-y-3">
      {/* DATE RANGE FILTER */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4 flex justify-between gap-12 items-center">
        <div className="flex gap-4 items-center justify-center">
          <div>
            <label className="text-sm text-gray-600 mr-2">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mr-2">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <Button onClick={loadSummary}>Apply</Button>
          <Button variant="outline" onClick={loadDetails}>
            View Details
          </Button>
        </div>

        {summary && (
          <div className="flex gap-12 mx-10 items-center justify-evenly">
            <div>
              <p className="text-gray-500 text-base">Total</p>
              <p className="text-xl font-semibold">{summary.total_marked}</p>
            </div>

            <div>
              <p className="text-gray-500 text-base">Taken</p>
              <p className="text-xl font-semibold text-green-600">
                {summary.total_taken}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-base">Upcoming</p>
              <p className="text-xl font-semibold text-yellow-600">
                {summary.upcoming}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CALENDAR */}
      <div className="bg-white p-6 rounded-xl shadow">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-175 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Leave Details ({fromDate} → {toDate})
            </h2>

            {details.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-2">Date</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((leave) => (
                    <tr key={leave.id} className="border-b">
                      <td className="p-2">{leave.leave_date.split("T")[0]}</td>

                      <td className="p-2">
                        {leave.leave_type === "half"
                          ? leave.half_day_type === "first"
                            ? "First Half"
                            : "Second Half"
                          : "Full Day"}
                      </td>

                      <td className="p-2">
                        <span
                          className={
                            leave.status === "taken"
                              ? "text-green-600 font-medium"
                              : "text-yellow-600 font-medium"
                          }
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="p-2">{leave.reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center text-gray-500">
                No leaves available for selected range.
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editingLeave ? "Edit Leave" : "Add Leave"} — {selectedDate}
            </h2>

            <select
              className="border p-2 w-full mb-3"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>

            {leaveType === "half" && (
              <select
                className="border p-2 w-full mb-3"
                value={halfDayType}
                onChange={(e) => setHalfDayType(e.target.value)}
              >
                <option value="first">First Half</option>
                <option value="second">Second Half</option>
              </select>
            )}

            <textarea
              placeholder="Reason"
              className="border p-2 w-full mb-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              {editingLeave && (
                <Button variant="danger" onClick={deleteLeave}>
                  Delete
                </Button>
              )}

              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={saveLeave}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
