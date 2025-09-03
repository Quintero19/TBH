import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import Logo from "/img/logos/tbh1.png";
import "@/styles/css/NewNavigation.css";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { getCurrentUser } from "@/service/authService";

export const NewNavigation = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [user, setUser] = useState(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);


	const navigate = useNavigate();
	
	const handleLogout = async () => {
			try {
				await api.post('/logout/'),
					{
						method: "POST",
						credentials: "include",
					};
				navigate("/login");
			} catch (error) {
				console.error("Error al cerrar sesión:", error);
			}
		};


	useEffect(() => {

		getCurrentUser().then((u) => setUser(u));

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
							{ to: "features", label: "Nosotros" },
							{ to: "about", label: "Style Perfum" },
							{ to: "services", label: "Productos" },
							{ to: "portfolio", label: "Agendamiento" },
							{ to: "contact", label: "Contacto" },
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
						<li className="nav-item relative">
								{user ? (
									<div className="relative">
									<button
										type="button"
										onClick={() => setDropdownOpen((prev) => !prev)}
										className="nav-button flex items-center gap-2"
									>
										Bienvenido {user.nombre ?? ""}
										<svg
										className={`w-4 h-4 transition-transform ${
											dropdownOpen ? "rotate-180" : ""
										}`}
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										viewBox="0 0 24 24"
										>
										<path d="M19 9l-7 7-7-7" />
										</svg>
									</button>

									{dropdownOpen && (
										<div className="menu">
											<a href="/usuario/perfil" className="menu-item">
											Mi Perfil
											</a>
											<button onClick={handleLogout} className="menu-item">
											Cerrar Sesión
											</button>
										</div>
										)}
									</div>
								) : (
									<a href="/login" className="nav-button">
									Ingresar
									</a>
								)}
								</li>
					</ul>
				</div>
			</div>
		</nav>
	);
};
