"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function CalendarView() {
  const [events, setEvents] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingLeave, setEditingLeave] = useState<any>(null);

  const [leaveType, setLeaveType] = useState("full");
  const [halfDayType, setHalfDayType] = useState("first");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("planned");

  // ================= LOAD DATA =================
  async function loadData() {
    // 🔹 Get ALL leaves for admin
    const leavesRes = await fetch("/api/leaves?userId=all");
    const leaves = await leavesRes.json();

    const formatted = leaves.map((leave: any) => ({
      id: leave.id,
      title: `${leave.employeeName || "Unknown"} - ${
        leave.leave_type === "half"
          ? leave.half_day_type === "first"
            ? "First Half"
            : "Second Half"
          : "Full Day"
      }`,
      start: leave.leave_date,
      allDay: true,
      backgroundColor:
        leave.status === "taken" ? "#4ade80" : "#facc15",
      textColor: "#000",
      extendedProps: {
        userId: leave.user_id,
        employeeName: leave.employeeName,
        leaveType: leave.leave_type,
        halfDayType: leave.half_day_type,
        reason: leave.reason,
        status: leave.status,
      },
    }));

    setEvents(formatted);

    // 🔹 Get employee list
    const summaryRes = await fetch("/api/admin/summary");
    const summary = await summaryRes.json();
    setEmployees(summary);
  }

  useEffect(() => {
    loadData();
  }, []);

  // ================= CLICK EMPTY DATE =================
  function handleDateClick(info: any) {
    setEditingLeave(null);
    setSelectedDate(info.dateStr);

    setSelectedEmployee(""); // reset
    setLeaveType("full");
    setHalfDayType("first");
    setReason("");
    setStatus("planned");
  }

  // ================= CLICK EXISTING EVENT =================
  function handleEventClick(info: any) {
    const event = info.event;

    setEditingLeave({ id: event.id });

    setSelectedEmployee(event.extendedProps.userId);
    setSelectedDate(event.startStr);
    setLeaveType(event.extendedProps.leaveType || "full");
    setHalfDayType(event.extendedProps.halfDayType || "first");
    setReason(event.extendedProps.reason || "");
    setStatus(event.extendedProps.status || "planned");
  }

  // ================= SAVE =================
  async function saveLeave() {
    if (!editingLeave && !selectedEmployee) {
      alert("Please select employee");
      return;
    }

    await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        leaveType,
        halfDayType,
        reason,
        status,
        targetUserId: selectedEmployee,
      }),
    });

    closeModal();
    await loadData();
  }

  // ================= DELETE =================
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
    <div className="space-y-6">
      {/* CALENDAR */}
      <div className="bg-white rounded-xl shadow p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="500px"
        />
      </div>

      {/* MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-lg font-semibold">
              {editingLeave ? "Edit Leave" : "Add Leave"}
            </h2>

            {/* 🔹 EMPLOYEE SELECT (ONLY WHEN ADDING) */}
            {!editingLeave && (
              <select
                className="border p-2 w-full rounded"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}

            {/* 🔹 Show employee name when editing */}
            {editingLeave && (
              <div className="text-sm text-gray-500">
                Employee:{" "}
                {
                  employees.find(
                    (e: any) => e.id === selectedEmployee
                  )?.name
                }
              </div>
            )}

            {/* Leave Type */}
            <select
              className="border p-2 w-full rounded"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>

            {/* Half Day Option */}
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

            {/* Status */}
            <select
              className="border p-2 w-full rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="planned">Planned</option>
              <option value="taken">Taken</option>
            </select>

            {/* Reason */}
            <textarea
              placeholder="Reason"
              className="border p-2 w-full rounded"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-between pt-4">
              {editingLeave && (
                <Button variant="danger" onClick={deleteLeave}>
                  Delete
                </Button>
              )}

              <div className="flex gap-3 ml-auto">
                <Button onClick={closeModal} variant="outline">
                  Cancel
                </Button>

                <Button onClick={saveLeave} variant="primary">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}