import React, { useState, useEffect } from "react";
import { Navigation } from "../../components/Landing/Navigation";
import { Header } from "../../components/Landing/Header";
import { Features } from "../../components/Landing/Features";
import { About } from "../../components/Landing/About";
import { Services } from "../../components/Landing/Services";
import { Gallery } from "../../components/Landing/Gallery";
import { Testimonials } from "../../components/Landing/testimonials";
import { Team } from "../../components/Landing/Team";
import { Contact } from "../../components/Landing/Contact";
import JsonData from "../../data/data.json";
import "../../styles/css/App.css";
import AOS from 'aos';
import 'aos/dist/aos.css';

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
      <Navigation />
      <Header data={landingPageData.Header} data-aos="zoom-in" data-aos-delay="100" />
      <Features data={landingPageData.Features} data-aos="zoom-in" data-aos-delay="200" />
      <About data={landingPageData.About} data-aos="zoom-in" data-aos-delay="300" />
      <Services data={landingPageData.Services} data-aos="zoom-in" data-aos-delay="400" />
      <Gallery data={landingPageData.Gallery} data-aos="zoom-in" data-aos-delay="500" />
      <Testimonials data={landingPageData.Testimonials} data-aos="zoom-in" data-aos-delay="600" />
      <Team data={landingPageData.Team} data-aos="zoom-in" data-aos-delay="700" />
      <Contact data={landingPageData.Contact} data-aos="zoom-in" data-aos-delay="800" />
    </div>
  );
};

export default Home;
