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



const Home = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <div>
      <Navigation />
      <Header data={landingPageData.Header} />
      <Features data={landingPageData.Features} />
      <About data={landingPageData.About} />
      <Services data={landingPageData.Services} />
      <Gallery data={landingPageData.Gallery} />
      <Testimonials data={landingPageData.Testimonials} />
      <Team data={landingPageData.Team} />
      <Contact data={landingPageData.Contact} />
    </div>
  );
};

export default Home;
