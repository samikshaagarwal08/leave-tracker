"use client";

import CalendarView from "@/components/CalendarView";
import EmployeeList from "@/components/EmployeeList";
import Button from "@/components/ui/Button";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [tab, setTab] = useState("calendar");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mx-10 my-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        <Button
          className="cursor-pointer"
          onClick={() => setShowCreateUser(true)}
        >
          Add New User
        </Button>
      </div>

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

      {showCreateUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-lg font-semibold">Create New User</h2>

            <input
              placeholder="First Name"
              className="border p-2 w-full"
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />

            <input
              placeholder="Last Name"
              className="border p-2 w-full"
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />

            <input
              placeholder="Email"
              className="border p-2 w-full"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="border p-2 w-full pr-12 rounded"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600"
              >
                {showPassword ? <Eye size={16} /> : <EyeClosed size={16}/>}
              </button>
            </div>

            <select
              className="border p-2 w-full"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateUser(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  await fetch("/api/admin/create-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  });

                  setShowCreateUser(false);
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "calendar" && <CalendarView />}
      {tab === "employees" && <EmployeeList />}
    </div>
  );
}
