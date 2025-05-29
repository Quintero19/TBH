import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import Logo from "/img/logos/tbh1.png";
import "../../styles/css/NewNavigation.css";

export const NewNavigation = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
		if (!isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
	};

	return (
		<nav className={`new-nav ${isScrolled ? "scrolled" : ""}`}>
			<div className="nav-container">
				<div className="nav-header">
					<Link
						to="page-top"
						smooth={true}
						duration={500}
						offset={-70}
						spy={true}
						activeClass="active"
						className="nav-brand"
					>
						<img src={Logo} alt="The Barber House Logo" className="nav-logo" />
						<span className="nav-title">THE BARBER HOUSE</span>
					</Link>
					<button
						type="button"
						onClick={toggleMenu}
						className={`nav-toggle ${isOpen ? "active" : ""}`}
						aria-label="Toggle navigation"
					>
						<span className="nav-icon" />
						<span className="nav-icon" />
						<span className="nav-icon" />
					</button>
				</div>

				<div className={`nav-menu ${isOpen ? "show" : ""}`}>
					<ul className="nav-list">
						{[
							{ to: "features", label: "Features" },
							{ to: "about", label: "About" },
							{ to: "services", label: "Services" },
							{ to: "portfolio", label: "Gallery" },
							{ to: "testimonials", label: "Testimonials" },
							{ to: "team", label: "Team" },
							{ to: "contact", label: "Contact" },
						].map((item) => (
							<li key={item.to} className="nav-item">
								<Link
									to={item.to}
									smooth={true}
									duration={500}
									offset={-70}
									spy={true}
									activeClass="active"
									className="nav-link"
									onClick={() => {
										setIsOpen(false);
										document.body.style.overflow = "unset";
									}}
								>
									{item.label}
								</Link>
							</li>
						))}
						<li className="nav-item">
							<a href="/login" className="nav-button">
								Ingresar
							</a>
						</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};
