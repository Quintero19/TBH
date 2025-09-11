// src/components/CalendarioAgendamientos.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

const CalendarioAgendamientos = ({ eventos, onSelectFecha }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const handleDateClick = (info) => {
    setFechaSeleccionada(info.dateStr);
    onSelectFecha(info.dateStr);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <style dangerouslySetInnerHTML={{
        __html: `
          .fc-daygrid-day:hover {
            background-color: #fef3c7 !important;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          
          .fc-daygrid-day.fc-day-selected {
            background-color: #fbbf24 !important;
            color: white !important;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(251, 191, 36, 0.3);
            transform: scale(1.05);
            transition: all 0.3s ease;
            border: 2px solid #f59e0b !important;
          }
          
          .fc-daygrid-day.fc-day-selected .fc-daygrid-day-number {
            color: white !important;
            font-weight: bold;
          }
          
          .fc-daygrid-day.fc-day-today {
            background-color: #dbeafe !important;
            border: 2px solid #3b82f6 !important;
          }
          
          .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
            color: #1e40af !important;
            font-weight: bold;
          }
          
          .fc-event {
            border-radius: 4px !important;
            font-size: 0.8rem !important;
            padding: 2px 4px !important;
          }
          
          .fc-event:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease;
          }
          
          .fc-button {
            background-color: #f59e0b !important;
            border-color: #f59e0b !important;
            color: white !important;
            border-radius: 6px !important;
            font-weight: 500 !important;
          }
          
          .fc-button:hover {
            background-color: #d97706 !important;
            border-color: #d97706 !important;
          }
          
          .fc-button:focus {
            box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3) !important;
          }
          
          .fc-toolbar-title {
            color: #1f2937 !important;
            font-weight: 700 !important;
          }
        `
      }} />
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          list: "Lista"
        }}
        dayHeaderFormat={{
          weekday: "long"
        }}
        events={eventos}
        dateClick={handleDateClick}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          alert(`Agendamiento: ${info.event.title}\nFecha: ${info.event.start.toLocaleDateString('es-ES')}\nHora: ${info.event.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
        }}
        height="auto"
        dayCellClassNames={(info) => {
          const dateStr = info.date.toISOString().split('T')[0];
          const isSelected = fechaSeleccionada === dateStr;
          return isSelected ? 'fc-day-selected' : '';
        }}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
      />
    </div>
  );
};

CalendarioAgendamientos.propTypes = {
  eventos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    start: PropTypes.string,
    end: PropTypes.string,
    color: PropTypes.string,
  })).isRequired,
  onSelectFecha: PropTypes.func.isRequired,
};

export default CalendarioAgendamientos;
