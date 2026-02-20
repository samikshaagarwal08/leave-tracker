"use client";

import CalendarView from "@/components/CalendarView";
import EmployeeList from "@/components/EmployeeList";
import { useState } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("calendar");

  return (
    <div className="mx-10 my-6 space-y-4">
      <h1 className="text-2xl font-semibold text-center">Admin Dashboard</h1>

      <div className="flex justify-center gap-4 border-b text-lg">
        <button
          onClick={() => setTab("calendar")}
          className={`cursor-pointer w-1/2 border border-b-0 rounded-t-md font-semibold px-2 py-1  ${
            tab === "calendar"
              ? "border-amber-500 bg-amber-100 "
              : "text-black border-black"
          }`}
        >
          Calendar
        </button>

        <button
          onClick={() => setTab("employees")}
          className={`cursor-pointer w-1/2 border border-b-0 px-2 py-1 rounded-t-md font-semibold ${
            tab === "employees"
              ? "border-amber-500 bg-amber-100"
              : "text-black border-black"
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
