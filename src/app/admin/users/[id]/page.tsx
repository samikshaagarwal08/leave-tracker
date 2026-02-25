"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useParams } from "next/navigation";

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

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadData() {
    try {
      setLoadingPage(true);

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
        backgroundColor: leave.status === "taken" ? "#22c55e" : "#facc15",
        textColor: "#000",
        extendedProps: leave,
      }));

      setEvents(formatted);

      const summaryRes = await fetch(`/api/admin/summary`);
      const allEmployees = await summaryRes.json();
      const emp = allEmployees.find((e: any) => e.id === userId);

      if (emp) {
        setEmployeeName(emp.name);
        setSummary(emp);
      }
    } finally {
      setLoadingPage(false);
    }
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
    setLeaveType(event.extendedProps.leave_type || "full");
    setHalfDayType(event.extendedProps.half_day_type || "first");
    setStatus(event.extendedProps.status || "planned");
    setReason(event.extendedProps.reason || "");
  }

  async function saveLeave() {
    if (!selectedDate || saving) return;

    try {
      setSaving(true);

      await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          leaveType,
          halfDayType,
          status,
          reason,
          targetUserId: userId,
        }),
      });

      closeModal();
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  async function deleteLeave() {
    if (!editingLeave || deleting) return;

    try {
      setDeleting(true);

      await fetch("/api/leaves", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingLeave.id }),
      });

      closeModal();
      await loadData();
    } finally {
      setDeleting(false);
    }
  }

  function closeModal() {
    setSelectedDate(null);
    setEditingLeave(null);
  }

  return (
    <div className="px-10 py-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center text-black w-1/2">
          <h1 className="text-xl font-semibold ">Employee Overview - </h1>
          <p className="text-gray-800 text-lg mr-1">{employeeName}</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-1/2">
            <div className="bg-white p-3 rounded-2xl shadow border">
              <p className="text-sm text-gray-500">Total Marked</p>
              <p className="text-xl font-semibold mt-1">
                {summary.total_marked}
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow border">
              <p className="text-sm text-gray-500">Taken</p>
              <p className="text-xl font-semibold mt-1 text-green-600">
                {summary.total_taken}
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow border">
              <p className="text-sm text-gray-500">Upcoming</p>
              <p className="text-xl font-semibold mt-1 text-yellow-600">
                {summary.upcoming}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loader */}
      {loadingPage ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Calendar */}
          <div className="bg-white p-8 rounded-2xl shadow border">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="500px"
            />
          </div>
        </>
      )}

      {/* Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[95%] max-w-md shadow-xl space-y-5">
            <h2 className="text-xl font-semibold">
              {editingLeave ? "Edit Leave" : "Add Leave"}
            </h2>

            <p className="text-sm text-gray-500">{selectedDate}</p>

            <select
              className="border p-2 w-full rounded-lg"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>

            {leaveType === "half" && (
              <select
                className="border p-2 w-full rounded-lg"
                value={halfDayType}
                onChange={(e) => setHalfDayType(e.target.value)}
              >
                <option value="first">First Half</option>
                <option value="second">Second Half</option>
              </select>
            )}

            <select
              className="border p-2 w-full rounded-lg"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="planned">Planned</option>
              <option value="taken">Taken</option>
            </select>

            <textarea
              placeholder="Reason"
              className="border p-2 w-full rounded-lg"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <div className="flex justify-between pt-4">
              {editingLeave && (
                <Button
                  variant="danger"
                  onClick={deleteLeave}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              )}

              <div className="flex gap-3 ml-auto">
                <Button onClick={closeModal} variant="outline">
                  Cancel
                </Button>

                <Button onClick={saveLeave} variant="primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
