"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/leaves")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((leave: any) => ({
          title: leave.status,
          date: leave.leave_date,
        }));
        setEvents(formatted);
      });
  }, []);

  async function handleDateClick(info: any) {
    await fetch("/api/leaves", {
      method: "POST",
      body: JSON.stringify({ date: info.dateStr }),
    });

    location.reload();
  }

  return (
    <div className="p-8">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={events}
      />
    </div>
  );
}
