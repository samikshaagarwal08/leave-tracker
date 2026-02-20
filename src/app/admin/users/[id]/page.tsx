"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useParams } from "next/navigation";
import { text } from "stream/consumers";

export default function EmployeeDetail() {
  const params = useParams();
  const userId = params.id as string;

  const [events, setEvents] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingLeave, setEditingLeave] = useState<any>(null);

  const [leaveType, setLeaveType] = useState("full");
  const [halfDayType, setHalfDayType] = useState("first");
  const [status, setStatus] = useState("planned");
  const [reason, setReason] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  async function loadData() {
    const leavesRes = await fetch(`/api/leaves?userId=${userId}`);
    const leaves = await leavesRes.json();

    const formatted = leaves.map((leave: any) => ({
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
      extendedProps: {
        leaveType: leave.leave_type,
        halfDayType: leave.half_day_type,
        status: leave.status,
        reason: leave.reason,
      },
    }));

    setEvents(formatted);

    const summaryRes = await fetch(`/api/admin/summary`);
    const allEmployees = await summaryRes.json();

    const emp = allEmployees.find((e: any) => e.id === userId);
    if (emp) setEmployeeName(emp.name);
  }

  useEffect(() => {
    loadData();
  }, [userId]);

  function handleDateClick(info: any) {
    setEditingLeave(null);
    setSelectedDate(info.dateStr);
    setLeaveType("full");
    setHalfDayType("first");
    setStatus("planned");
    setReason("");
  }

  function handleEventClick(info: any) {
    const event = info.event;

    setEditingLeave({ id: event.id });
    setSelectedDate(event.startStr);
    setLeaveType(event.extendedProps.leaveType || "full");
    setHalfDayType(event.extendedProps.halfDayType || "first");
    setStatus(event.extendedProps.status || "planned");
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
        status,
        reason,
        targetUserId: userId, // 👈 important
      }),
    });

    closeModal();
    await loadData();
  }

  async function deleteLeave() {
    if (!editingLeave) return;

    await fetch("/api/leaves", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingLeave.id }),
    });

    closeModal();
    await loadData();
  }

  function closeModal() {
    setSelectedDate(null);
    setEditingLeave(null);
  }

  return (
    <div className="mx-10 my-6 space-y-8">
      <h1 className="text-2xl font-semibold">
        Employee Overview - {employeeName}
      </h1>

      {summary && (
        <div className="bg-white p-6 rounded-xl shadow flex gap-10">
          <div>
            <p className="text-gray-500 text-sm">Total Marked</p>
            <p className="text-xl font-semibold">{summary.total_marked}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Taken</p>
            <p className="text-xl font-semibold text-green-600">
              {summary.total_taken}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Upcoming</p>
            <p className="text-xl font-semibold text-yellow-600">
              {summary.upcoming}
            </p>
          </div>
        </div>
      )}

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

      {/* Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-lg font-semibold">
              {editingLeave ? "Edit Leave" : "Add Leave"}
            </h2>

            <select
              className="border p-2 w-full rounded"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>

            {leaveType === "half" && (
              <select
                className="border p-2 w-full rounded"
                value={halfDayType}
                onChange={(e) => setHalfDayType(e.target.value)}
              >
                <option value="first">First Half</option>
                <option value="second">Second Half</option>
              </select>
            )}

            <select
              className="border p-2 w-full rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="planned">Planned</option>
              <option value="taken">Taken</option>
            </select>

            <textarea
              placeholder="Reason"
              className="border p-2 w-full rounded"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-between pt-4">
              {editingLeave && (
                <button
                  onClick={deleteLeave}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              )}

              <div className="flex gap-3 ml-auto">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={saveLeave}
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
