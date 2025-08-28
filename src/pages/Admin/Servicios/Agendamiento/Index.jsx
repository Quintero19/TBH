import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../../components/sideBar";

export default function Usuario() {
  const navigate = useNavigate();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  const handleAdd = () => {
    navigate("/admin/servicios/agendamiento/AgregarAgendamiento");
  };

  // Eventos predefinidos - Incluyendo días anteriores
  const [events] = useState([
    // Días anteriores (ejemplos)
    { id: 101, day: 5, time: '10:00', title: 'Revisión mensual', past: true },
    { id: 102, day: 8, time: '14:00', title: 'Entrevistas', past: true },
    { id: 103, day: 12, time: '11:30', title: 'Presentación resultados', past: true },
    
    // Día actual y futuros
    { id: 1, day: 1, time: '09:00', title: 'Reunión gerencia' },
    { id: 2, day: 10, time: '14:50', title: 'Reunión semanal del equipo' },
    
    // Día 17 con agenda completa
    { id: 3, day: 17, time: '08:00', title: 'Desayuno con equipo' },
    { id: 4, day: 17, time: '09:30', title: 'Revisión de proyectos' },
    { id: 5, day: 17, time: '11:00', title: 'Entrega de producto' },
    { id: 6, day: 17, time: '12:30', title: 'Almuerzo con clientes' },
    { id: 7, day: 17, time: '13:00', title: 'Executives Media' },
    { id: 8, day: 17, time: '14:30', title: 'Reunión de ventas' },
    { id: 9, day: 17, time: '16:00', title: 'Presentación nuevos productos' },
    { id: 10, day: 17, time: '17:30', title: 'Planificación estratégica' },
    { id: 11, day: 17, time: '19:00', title: 'Cena de negocios' },
    
    { id: 12, day: 22, time: '14:00', title: 'Weekly Managers' },
    { id: 13, day: 25, time: '', title: 'Entrega de producto' }
  ]);

  // Verificar si es el mes actual
  const isCurrentMonth = () => {
    const now = new Date();
    return (
      currentDate.getFullYear() === now.getFullYear() &&
      currentDate.getMonth() === now.getMonth()
    );
  };

  // Obtener el día actual
  const getCurrentDay = () => {
    const now = new Date();
    return now.getDate();
  };

  // Verificar si una fecha es anterior al día actual
  const isPastDate = (day) => {
    const now = new Date();
    const selected = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      parseInt(day),
    );
    now.setHours(0, 0, 0, 0);
    return selected < now;
  };

  // Manejar cambio de mes
  const changeMonth = (increment) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + increment,
      1,
    );
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowEventModal(false);
  };

  // Manejar selección de fecha
  const handleDateClick = (day) => {
    // Permitir clic en cualquier día para ver eventos
    const dayEvents = events.filter(event => event.day === parseInt(day));
    setSelectedDayEvents(dayEvents);
    setSelectedDate(day);
    setShowEventModal(true);
  };

  // Manejar selección de hora y redirigir
  const handleTimeClick = (time) => {
    if (!selectedDate) return;

    setSelectedTime(time);

    // Crear objeto con los datos de la cita
    const appointmentData = {
      date: `${selectedDate}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
      time: time,
      monthName: monthNames[currentDate.getMonth()],
    };

    // Redirigir usando la nueva función handleAdd
    handleAdd();
  };

  // Generar días del mes
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrent = isCurrentMonth();
    const currentDay = getCurrentDay();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: "", disabled: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const isPast =
        isCurrent &&
        dayDate < today &&
        !(
          dayDate.getDate() === today.getDate() &&
          dayDate.getMonth() === today.getMonth() &&
          dayDate.getFullYear() === today.getFullYear()
        );
      
      // Permitir agendar en el día actual incluso si es "pasado" en comparación con la hora actual
      const isToday = (
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear()
      );
      
      days.push({
        day: i.toString(),
        disabled: isPast && !isToday, // No deshabilitar el día actual
        isToday: isToday,
        selectable: isCurrent && (dayDate >= today || isToday), // Permitir día actual
        isPast: isPast && !isToday, // Marcar como día pasado
      });
    }

    return days;
  };

  // Nombres de los días y meses
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Todos los horarios disponibles
  const allTimeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", 
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM"
  ];

  // Función para obtener los horarios ocupados de un día específico
  const getBookedTimes = (day) => {
    const dayEvents = events.filter(event => event.day === parseInt(day));
    return dayEvents.map(event => event.time).filter(time => time !== '');
  };

  // Función para obtener los horarios disponibles de un día
  const getAvailableTimeSlots = (day) => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Si es un día pasado, no hay horarios disponibles para agendar
    if (isPastDate(day)) {
      return [];
    }
    
    const bookedTimes = getBookedTimes(day);
    
    // Si no es el día actual, mostrar todos los horarios no ocupados
    if (parseInt(day) !== currentDay || currentDate.getMonth() !== currentMonth || currentDate.getFullYear() !== currentYear) {
      return allTimeSlots.filter(time => !bookedTimes.includes(time));
    }
    
    // Para el día actual, filtrar horarios que ya pasaron
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    return allTimeSlots.filter(time => {
      // Verificar si el horario está ocupado
      if (bookedTimes.includes(time)) return false;
      
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      // Convertir a formato 24h
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      // Verificar si la hora ya pasó
      if (hours < currentHour) return false;
      if (hours === currentHour && minutes <= currentMinutes) return false;
      
      return true;
    });
  };

  const calendarDays = generateCalendarDays();
  const isCurrent = isCurrentMonth();

  return (
    <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div className="content" style={{ flex: 1, padding: "20px", position: "relative" }}>
        <h1>Calendario</h1>

        {/* Controles del mes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <button
            onClick={() => changeMonth(-1)}
            style={{
              padding: "8px 16px",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            &lt; Mes Anterior
          </button>
          <h2 style={{ margin: 0 }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            style={{
              padding: "8px 16px",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Siguiente Mes &gt;
          </button>
        </div>

        {/* Calendario con eventos */}
        <div style={{ margin: "20px 0", maxWidth: "800px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "5px",
              marginBottom: "10px",
            }}
          >
            {dayNames.map((day) => (
              <div
                key={day}
                style={{ 
                  textAlign: "center", 
                  fontWeight: "bold", 
                  padding: "5px", 
                  backgroundColor: "#f8f8f8",
                  fontSize: "14px"
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "5px",
            }}
          >
            {calendarDays.map(
              ({ day, disabled, isToday, selectable, isPast }, index) => {
                const dayEvents = events.filter(event => event.day === parseInt(day));
                const isFullDay = parseInt(day) === 17 && dayEvents.length > 0;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    style={{
                      minHeight: "70px",
                      border: isToday ? "2px solid #4CAF50" : 
                               isFullDay ? "2px solid #ff9800" : 
                               isPast ? "1px solid #ccc" : "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      backgroundColor: isPast
                        ? "#f5f5f5"
                        : selectedDate === day
                          ? "#4CAF50"
                          : isFullDay
                            ? "#fff3e0"
                            : selectable
                              ? "#e3f2fd"
                              : "white",
                      color: isPast
                        ? "#888"
                        : selectedDate === day
                          ? "white"
                          : isToday
                            ? "#4CAF50"
                            : isFullDay
                              ? "#e65100"
                              : selectable
                                ? "#2196F3"
                                : "black",
                      padding: "5px",
                      position: "relative",
                      opacity: day ? 1 : 0.7,
                      fontSize: "13px",
                    }}
                    title={
                      isPast 
                        ? "Ver eventos de este día (pasado)" 
                        : isFullDay 
                          ? "Día con agenda completa - Haz clic para ver eventos" 
                          : dayEvents.length > 0 ? "Haz clic para ver eventos y agendar" : "Haz clic para ver/agendar"
                    }
                  >
                    <div style={{ 
                      fontWeight: "bold", 
                      marginBottom: "3px",
                      color: isPast ? "#888" : isFullDay ? "#e65100" : "inherit"
                    }}>
                      {day}
                      {isFullDay && " 📅"}
                      {isPast && " ◄"}
                    </div>
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        style={{
                          fontSize: "10px",
                          backgroundColor: isPast ? "#eeeeee" : "#e9f5ff",
                          padding: "2px",
                          marginBottom: "2px",
                          borderRadius: "2px",
                          borderLeft: `2px solid ${isPast ? "#9e9e9e" : "#4a90e2"}`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={event.title}
                      >
                        {event.time && (
                          <span style={{ fontWeight: "bold", color: isPast ? "#757575" : "#4a90e2" }}>
                            {event.time}
                          </span>
                        )}
                        <span> {event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div style={{ 
                        fontSize: "10px", 
                        color: isPast ? "#9e9e9e" : "#666", 
                        marginTop: "2px",
                        fontWeight: isFullDay ? "bold" : "normal"
                      }}>
                        +{dayEvents.length - 2} más
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* Modal de eventos existentes con opción de agendar */}
        {showEventModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px"
              }}>
                <h2 style={{ 
                  margin: 0, 
                  color: isPastDate(selectedDate) ? "#757575" : 
                         selectedDayEvents.length > 5 ? "#e65100" : "#2196F3" 
                }}>
                  {isPastDate(selectedDate) ? "📅 Eventos pasados - " : "📅 Agenda - "}
                  {selectedDate} de {monthNames[currentDate.getMonth()]}
                </h2>
                <button 
                  onClick={() => {
                    setShowEventModal(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#999"
                  }}
                >
                  ×
                </button>
              </div>
              
              {selectedDayEvents.length > 0 && (
                <div style={{ 
                  marginBottom: "20px", 
                  padding: "10px", 
                  backgroundColor: isPastDate(selectedDate) ? "#f5f5f5" : "#f0f7ff", 
                  borderRadius: "6px",
                  borderLeft: `4px solid ${isPastDate(selectedDate) ? "#9e9e9e" : "#2196F3"}`
                }}>
                  <strong>
                    {isPastDate(selectedDate) ? "Eventos realizados: " : "Eventos programados: "}
                  </strong> 
                  {selectedDayEvents.length} evento(s) para este día.
                </div>
              )}
              
              {/* Lista de eventos existentes */}
              {selectedDayEvents.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h3 style={{ marginBottom: "10px", color: isPastDate(selectedDate) ? "#757575" : "#333" }}>
                    {isPastDate(selectedDate) ? "Eventos realizados" : "Eventos programados"}:
                  </h3>
                  <div style={{ 
                    maxHeight: "200px", 
                    overflowY: "auto", 
                    border: "1px solid #eee", 
                    borderRadius: "6px", 
                    padding: "10px",
                    backgroundColor: isPastDate(selectedDate) ? "#fafafa" : "#fff"
                  }}>
                    {selectedDayEvents.map(event => (
                      <div key={event.id} style={{
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: isPastDate(selectedDate) ? "#f5f5f5" : "white",
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", color: isPastDate(selectedDate) ? "#616161" : "#333" }}>
                            {event.title}
                          </div>
                          {event.time && (
                            <div style={{ color: isPastDate(selectedDate) ? "#9e9e9e" : "#666", fontSize: "14px" }}>
                              Hora: {event.time}
                            </div>
                          )}
                        </div>
                        {event.time && (
                          <span style={{
                            backgroundColor: isPastDate(selectedDate) ? "#bdbdbd" : "#4a90e2",
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold"
                          }}>
                            {event.time}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selector de horarios para nuevo evento (solo si no es día pasado) */}
              {!isPastDate(selectedDate) && (
                <div>
                  <h3 style={{ marginBottom: "10px" }}>
                    {selectedDayEvents.length > 0 ? "Agendar nuevo evento:" : "Selecciona un horario disponible:"}
                  </h3>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", 
                    gap: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "6px"
                  }}>
                    {getAvailableTimeSlots(selectedDate).length > 0 ? (
                      getAvailableTimeSlots(selectedDate).map((time) => (
                        <div
                          key={time}
                          onClick={() => handleTimeClick(time)}
                          style={{
                            padding: "8px",
                            border: "1px solid #4CAF50",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#e8f5e9",
                            color: "#2e7d32",
                            textAlign: "center",
                            fontWeight: "bold",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#4CAF50";
                            e.target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#e8f5e9";
                            e.target.style.color = "#2e7d32";
                          }}
                        >
                          {time}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "10px", textAlign: "center", color: "#666", gridColumn: "1 / -1" }}>
                        No hay horarios disponibles para este día
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}