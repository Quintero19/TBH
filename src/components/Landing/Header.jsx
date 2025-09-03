import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import "../../styles/css/Header.css";

export const Header = (props) => {
	const [scrollPosition, setScrollPosition] = useState(0);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleScroll = () => {
			const position = window.pageYOffset;
			setScrollPosition(position);
		};

		const handleMouseMove = (e) => {
			setMousePosition({
				x: Math.min(
					Math.max((e.clientX / window.innerWidth - 0.5) * 10, -10),
					10,
				),
				y: Math.min(
					Math.max((e.clientY / window.innerHeight - 0.5) * 10, -10),
					10,
				),
			});
		};

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return (
		<div className="header-wrapper">
			<header id="page-top" className="header-parallax">
				<div
					className="parallax-bg"
					style={{
						transform: `translateY(${scrollPosition * 0.5}px) translate(${mousePosition.x}px, ${mousePosition.y}px)`,
						opacity: Math.max(0.4, 1 - scrollPosition * 0.002),
					}}
				>
					<div
						className="overlay"
						style={{
							opacity: Math.max(0.3, 1 - scrollPosition * 0.003),
						}}
					/>
				</div>
				<div
					className="intro"
					data-aos="zoom-in"
					data-aos-delay="100"
					style={{
						transform: `translateY(${scrollPosition * 0.3}px) translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
						opacity: Math.max(0, 1 - scrollPosition * 0.004),
					}}
				>
					<div className="container">
						<div className="row">
							<div className="col-md-8 col-md-offset-2 intro-text">
								<h1 className="animate-text">
									{props.data ? props.data.title : "Loading"}
									<span className="title-underline" />
								</h1>
								<p className="animate-text-delay">
									Tu barberia de confianza que te brinda calidad 
								</p>
								<a
									href="#features"
									className="btn btn-custom btn-lg page-scroll animate-button"
								>
									Mas Informacion
								</a>
							</div>
						</div>
					</div>
				</div>
			</header>
		</div>
	);
};

Header.propTypes = {
	data: PropTypes.shape({
		title: PropTypes.string,
		paragraph: PropTypes.string,
	}),
};
