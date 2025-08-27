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

const Home = () => {
	const [landingPageData, setLandingPageData] = useState({});
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
		</div>
	);
};

export default Home;
