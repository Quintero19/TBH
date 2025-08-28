import React, { useState, useEffect } from "react";
import { About } from "../../components/Landing/About";
import { Contact } from "../../components/Landing/Contact";
import { Features } from "../../components/Landing/Features";
import { Gallery } from "../../components/Landing/Gallery";
import { Header } from "../../components/Landing/Header";
import { NewNavigation } from "../../components/Landing/NewNavigation";
import { Services } from "../../components/Landing/Services";
import JsonData from "../../data/data.json";
import "../../styles/css/App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { getCurrentUser } from "@/service/authService";
import { clienteService } from "@/service/clientes.service";
import ClienteForm from "../../components/ClienteForm";
import { showAlert } from "@/components/AlertProvider";

const Home = () => {
	const [user, setUser] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [landingPageData, setLandingPageData] = useState({});

	useEffect(() =>{
		getCurrentUser().then((u) => setUser(u));
	},[])
	
	useEffect(() => {
		const fetchData = async () => {
			try {
	
			if (!user?.documento)return;
			
			const cliente = await clienteService.listarClientePorDocumento(user?.documento);
			

			if (!cliente || !cliente.data) {
				setShowForm(true);
			}
			} catch (error) {
			if (error.response && error.response.status === 404) {
				setShowForm(true); 
			} else {
				showAlert("Error al obtener cliente", error.message || error, {
				type: "error",
				title: "Datos inválidos",
				});
			}
			}
		};
		
		fetchData();
		}, []);


	useEffect(() => {
		setLandingPageData(JsonData);
		AOS.init({
			duration: 2000,
			once: false,
			mirror: true,
		});
	}, []);



	return (
		<div>
			<NewNavigation />
			<Header
				data={landingPageData.Header}
				data-aos="zoom-in"
				data-aos-delay="100"
			/>
			<Features
				data={landingPageData.Features}
				data-aos="zoom-in"
				data-aos-delay="200"
			/>
			<About
				data={landingPageData.About}
				data-aos="zoom-in"
				data-aos-delay="300"
			/>
			<Services
				data={landingPageData.Services}
				data-aos="zoom-in"
				data-aos-delay="400"
			/>
			<Gallery
				data={landingPageData.Gallery}
				data-aos="zoom-in"
				data-aos-delay="500"
			/>
			<Contact
				data={landingPageData.Contact}
				data-aos="zoom-in"
				data-aos-delay="800"
			/>

			 {showForm && (
				<ClienteForm 
					documento={user?.documento} 
					onComplete={() => setShowForm(false)} 
				/>
				)} : (

				)

					
		</div>
	);
};

export default Home;
