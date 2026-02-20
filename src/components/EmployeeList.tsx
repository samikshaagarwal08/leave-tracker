"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then(setEmployees);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Employees Summary</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3">Employee</th>
            <th className="p-3">Total Marked</th>
            <th className="p-3">Taken</th>
            <th className="p-3">Upcoming</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 font-medium">
                <Link
                  href={`/admin/users/${emp.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {emp.name}
                </Link>
              </td>
              <td className="p-3">{emp.total_marked}</td>
              <td className="p-3 text-green-600">{emp.total_taken}</td>
              <td className="p-3 text-yellow-600">{emp.upcoming}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
