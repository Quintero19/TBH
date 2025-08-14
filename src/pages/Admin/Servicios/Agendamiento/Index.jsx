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

	const handleAdd = () => {
		navigate("/admin/agendamiento/agregar");
	};

	// Verificar si es el mes actual
	const isCurrentMonth = () => {
		const now = new Date();
		return (
			currentDate.getFullYear() === now.getFullYear() &&
			currentDate.getMonth() === now.getMonth()
		);
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
	};

	// Manejar selección de fecha (solo permitir en mes actual)
	const handleDateClick = (day) => {
		if (!isCurrentMonth()) return;

		const selected = new Date(
			currentDate.getFullYear(),
			currentDate.getMonth(),
			parseInt(day),
		);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (selected >= today) {
			setSelectedDate(day);
			setSelectedTime(null);
		}
	};

	// Manejar selección de hora y redirigir
	const handleTimeClick = (time) => {
		if (!isCurrentMonth() || !selectedDate) return;

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
			days.push({
				day: i.toString(),
				disabled: isPast,
				isToday:
					dayDate.getDate() === today.getDate() &&
					dayDate.getMonth() === today.getMonth() &&
					dayDate.getFullYear() === today.getFullYear(),
				selectable: isCurrent && dayDate >= today,
			});
		}

		return days;
	};

	// Nombres de los días y meses
	const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
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

	// Horarios disponibles
	const timeSlots = {
		morning: ["9:00 AM", "10:00 AM", "11:00 AM"],
		afternoon: [
			"12:00 PM",
			"1:00 PM",
			"2:00 PM",
			"3:00 PM",
			"4:00 PM",
			"5:00 PM",
		],
		evening: ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
	};

	const calendarDays = generateCalendarDays();
	const isCurrent = isCurrentMonth();

	return (
		<div className="container" style={{ display: "flex", minHeight: "100vh" }}>
			<Sidebar />
			<div className="content" style={{ flex: 1, padding: "20px" }}>
				<h1>Agendamiento de Citas</h1>

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
						{isCurrent && (
							<span
								style={{
									fontSize: "0.8em",
									color: "#4CAF50",
									marginLeft: "10px",
								}}
							>
								(Mes actual)
							</span>
						)}
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

				{/* Calendario */}
				<div style={{ margin: "20px 0" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(7, 1fr)",
							gap: "10px",
							marginBottom: "10px",
						}}
					>
						{dayNames.map((day) => (
							<div
								key={day}
								style={{ textAlign: "center", fontWeight: "bold" }}
							>
								{day}
							</div>
						))}
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(7, 1fr)",
							gap: "10px",
						}}
					>
						{calendarDays.map(
							({ day, disabled, isToday, selectable }, index) => (
								<div
									key={index}
									onClick={selectable ? () => handleDateClick(day) : undefined}
									style={{
										textAlign: "center",
										padding: "10px",
										border: isToday ? "2px solid #4CAF50" : "1px solid #ddd",
										borderRadius: "4px",
										cursor: selectable ? "pointer" : "default",
										backgroundColor: disabled
											? "#f9f9f9"
											: selectedDate === day
												? "#4CAF50"
												: selectable
													? "#e3f2fd"
													: "white",
										color: disabled
											? "#ccc"
											: selectedDate === day
												? "white"
												: isToday
													? "#4CAF50"
													: selectable
														? "#2196F3"
														: "black",
										minHeight: "40px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: isToday ? "bold" : "normal",
										opacity: selectable ? 1 : 0.7,
									}}
									title={
										!selectable
											? "Solo se pueden agendar citas en el mes actual"
											: ""
									}
								>
									{day}
								</div>
							),
						)}
					</div>
				</div>

				{/* Horas disponibles - solo mostrar si es mes actual y fecha seleccionada */}
				{isCurrent && selectedDate && (
					<div>
						<h2>
							Selecciona una hora para el {selectedDate} de{" "}
							{monthNames[currentDate.getMonth()]}:
						</h2>
						<br />

						<div style={{ marginBottom: "20px" }}>
							<h3>Mañana</h3>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
								{timeSlots.morning.map((time) => (
									<button
										key={time}
										onClick={() => handleTimeClick(time)}
										style={{
											padding: "5px 10px",
											border: "1px solid #ddd",
											borderRadius: "4px",
											cursor: "pointer",
											backgroundColor:
												selectedTime === time ? "#2196F3" : "white",
											color: selectedTime === time ? "white" : "black",
										}}
									>
										{time}
									</button>
								))}
							</div>
						</div>
						<br />
						<div style={{ marginBottom: "20px" }}>
							<h3>Tarde</h3>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
								{timeSlots.afternoon.map((time) => (
									<button
										key={time}
										onClick={() => handleTimeClick(time)}
										style={{
											padding: "5px 10px",
											border: "1px solid #ddd",
											borderRadius: "4px",
											cursor: "pointer",
											backgroundColor:
												selectedTime === time ? "#2196F3" : "white",
											color: selectedTime === time ? "white" : "black",
										}}
									>
										{time}
									</button>
								))}
							</div>
						</div>

						<div style={{ marginBottom: "20px" }}>
							<h3>Noche</h3>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
								{timeSlots.evening.map((time) => (
									<button
										key={time}
										onClick={() => handleTimeClick(time)}
										style={{
											padding: "5px 10px",
											border: "1px solid #ddd",
											borderRadius: "4px",
											cursor: "pointer",
											backgroundColor:
												selectedTime === time ? "#2196F3" : "white",
											color: selectedTime === time ? "white" : "black",
										}}
									>
										{time}
									</button>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Mensaje cuando se selecciona una fecha en un mes que no es el actual */}
				{!isCurrent && selectedDate && (
					<div
						style={{
							padding: "20px",
							background: "#fff3e0",
							border: "1px solid #ffcc80",
							borderRadius: "4px",
							margin: "20px 0",
						}}
					>
						<h3 style={{ color: "#e65100", marginTop: 0 }}>
							Solo se pueden agendar citas en el mes actual
						</h3>
						<p>
							Por favor, navega al mes de {monthNames[now.getMonth()]} para
							agendar una cita.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
