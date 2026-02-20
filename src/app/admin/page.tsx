"use client";

import CalendarView from "@/components/CalendarView";
import EmployeeList from "@/components/EmployeeList";
import { useState } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("calendar");

  return (
    <div className="mx-10 my-12 space-y-8">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <div className="flex gap-6 border-b">
        <button
          onClick={() => setTab("calendar")}
          className={`pb-2 ${
            tab === "calendar"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Calendar
        </button>

        <button
          onClick={() => setTab("employees")}
          className={`pb-2 ${
            tab === "employees"
              ? "border-b-2 border-black font-semibold"
              : "text-gray-500"
          }`}
        >
          Employees
        </button>
      </div>

      {tab === "calendar" && <CalendarView />}
      {tab === "employees" && <EmployeeList />}
    </div>
  );
}
