// src/components/CalendarioAgendamientos.jsx
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarioAgendamientos = ({ eventos, onSelectFecha }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={eventos}
        dateClick={(info) => onSelectFecha(info.dateStr)} // cuando seleccionas día
        eventClick={(info) => alert(`Agendamiento: ${info.event.title}`)}
        height="auto"
      />
    </div>
  );
};

export default CalendarioAgendamientos;
