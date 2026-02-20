"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function EmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 🔹 Load Summary
  async function loadData() {
    if (loadingSummary) return;

    try {
      setLoadingSummary(true);

      let url = "/api/admin/summary";
      if (fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error loading summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  }

  // 🔹 Load Details
  async function loadDetails() {
    if (!fromDate || !toDate || loadingDetails) return;

    try {
      setLoadingDetails(true);

      const res = await fetch(
        `/api/admin/range-details?from=${fromDate}&to=${toDate}`
      );
      const data = await res.json();
      setDetails(data);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-semibold mb-8 text-gray-800">
        Employees Leave Summary
      </h2>

      {/* 🔹 Filter Section */}
      <div className="flex flex-wrap gap-4 mb-8 items-end bg-gray-50 p-5 rounded-xl">
        <div>
          <label className="block text-sm text-gray-600 mb-1 mr-2">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1 mr-2">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <Button
          onClick={loadData}
          variant="primary"
          disabled={loadingSummary}
        >
          {loadingSummary ? "Loading..." : "Apply Filter"}
        </Button>

        <Button
          onClick={loadDetails}
          variant="outline"
          disabled={!fromDate || !toDate || loadingDetails}
        >
          {loadingDetails ? "Loading..." : "View Leave Details"}
        </Button>
      </div>

      {/* 🔹 Summary Loader */}
      {loadingSummary ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No employee data found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-4">Employee</th>
                <th className="p-4">Total Marked</th>
                <th className="p-4">Taken</th>
                <th className="p-4">Upcoming</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">
                    <Link
                      href={`/admin/users/${emp.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {emp.name}
                    </Link>
                  </td>

                  <td className="p-4">{emp.total_marked}</td>

                  <td className="p-4 text-green-600 font-semibold">
                    {emp.total_taken}
                  </td>

                  <td className="p-4 text-yellow-600 font-semibold">
                    {emp.upcoming}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[95%] max-w-5xl max-h-[85vh] overflow-y-auto shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Leave Details ({fromDate} → {toDate})
            </h2>

            {loadingDetails ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Reason</th>
                    </tr>
                  </thead>

                  <tbody>
                    {details.map((leave) => (
                      <tr key={leave.id} className="border-t">
                        <td className="p-3">{leave.employeeName}</td>
                        <td className="p-3">{leave.leave_date}</td>
                        <td className="p-3">
                          {leave.leave_type === "half"
                            ? leave.half_day_type === "first"
                              ? "First Half"
                              : "Second Half"
                            : "Full Day"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              leave.status === "taken"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="p-3">{leave.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <Button
                onClick={() => setShowModal(false)}
                variant="primary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}