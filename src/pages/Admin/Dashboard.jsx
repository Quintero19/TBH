import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import React from "react";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "../../components/sideBar";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
);

const generateRandomData = () => {
	return Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000));
};

const months = [
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

export default function Dashboard() {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await fetch("http://localhost:3000/api/logout/", {
				method: "POST",
				credentials: "include",
			});
			navigate("/login");
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
		}
	};

	const lineData = generateRandomData();
	const barData = generateRandomData();
	const scatterData = generateRandomData();
	const pieData = generateRandomData();

	const lineChartData = {
		labels: months,
		datasets: [
			{
				label: "Ventas (Líneas)",
				data: lineData,
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
				tension: 0.1,
			},
		],
	};

	const barChartData = {
		labels: months,
		datasets: [
			{
				label: "Compras (Barras)",
				data: barData,
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
			},
		],
	};

	const scatterChartData = {
		datasets: [
			{
				label: "Puntos (Scatter)",
				data: months.map((month, index) => ({
					x: index + 1,
					y: scatterData[index],
				})),
				backgroundColor: "rgba(153, 102, 255, 0.6)",
			},
		],
	};

	const pieChartData = {
		labels: months,
		datasets: [
			{
				data: pieData,
				backgroundColor: [
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)",
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)",
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)",
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	const pieChartOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom",
			},
			tooltip: {
				callbacks: {
					label: (tooltipItem) => {
						return `${tooltipItem.label}: ${tooltipItem.raw}`;
					},
				},
			},
		},
		rotation: 0,
		cutout: "70%",
		spacing: 2,
	};

	return (
		<>
			<Sidebar />
			<div className="flex-1 md:ml-64 p-4 md:p-8">
				<HomeAdminContainer>
					<h1>Dashboard de Ventas y Compras</h1>

					<ChartsContainer>
						<ChartWrapper>
							<h3>Gráfica de Líneas</h3>
							<Line data={lineChartData} />
						</ChartWrapper>

						<ChartWrapper>
							<h3>Gráfica de Barras</h3>
							<Bar data={barChartData} />
						</ChartWrapper>

						<ChartWrapper>
							<h3>Gráfica de Puntos</h3>
							<Scatter data={scatterChartData} />
						</ChartWrapper>

						<ChartWrapperCentered>
							<h3>Gráfica de Torta</h3>
							<Pie data={pieChartData} options={pieChartOptions} />
						</ChartWrapperCentered>
					</ChartsContainer>
				</HomeAdminContainer>
			</div>
		</>
	);
}

const HomeAdminContainer = styled.div`
  padding: 20px;
  margin-top: -25px;
  
  h1 {
    text-align: center;
  }

  button {
    display: block;
    margin: 10px auto;
    padding: 8px 16px;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 240px;

  h3 {
    text-align: center;
    margin-bottom: 10px;
  }
`;

const ChartWrapperCentered = styled.div`
  width: 100%;
  height: 270px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  h3 {
    text-align: center;
    margin-bottom: 10px;
  }
`;
