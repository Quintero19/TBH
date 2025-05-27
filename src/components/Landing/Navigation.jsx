import React from "react";
import { Link } from "react-scroll";
import Logo from "/img/logos/tbh1.png";

export const Navigation = () => {
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <Link
            to="page-top"
            smooth={true}
            duration={500}
            offset={-70}
            spy={true}
            activeClass="active"
            className="navbar-brand page-scroll flex items-center cursor-pointer"
          >
            <img
              src={Logo}
              alt="The Barber House Logo"
              className="h-8 mr-3 object-contain"
              style={{ maxWidth: "80px" }}
            />
            <span className="brand-text">THE BARBER HOUSE</span>
          </Link>
        </div>

        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
            {[
              { to: "features", label: "Features" },
              { to: "about", label: "About" },
              { to: "services", label: "Services" },
              { to: "portfolio", label: "Gallery" },
              { to: "testimonials", label: "Testimonials" },
              { to: "team", label: "Team" },
              { to: "contact", label: "Contact" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  smooth={true}
                  duration={500}
                  offset={-70}
                  spy={true}
                  activeClass="active"
                  className="page-scroll cursor-pointer"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button className="btn btn-custom">
                <a href="/login" style={{ color: "inherit", textDecoration: "none" }}>
                  Ingresar
                </a>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
