import PropTypes from "prop-types";
import React from "react";
import Imagen from "../../assets/img/Hola1.jpg"

export const About = (props) => {
	return (
		<div id="about">
			<div className="container">
				<div className="row">
					<div
						className="col-xs-12 col-md-6"
						data-aos="fade-left"
						data-aos-delay="100"
					>
						<img src={Imagen} style={{width:"70%",margin:"0rem 8rem"}} alt="" />
					</div>
					<div
						className="col-xs-12 col-md-6"
						data-aos="fade-right"
						data-aos-delay="200"
					>
						<div className="about-text">
							<h2>Style Perfum</h2>
							<p>En Style Perfum encontrarás un espacio único donde se combinan tres estilos en un solo lugar: barbería, perfumería y moda. Nuestro objetivo es que te sientas renovado, seguro y con estilo en cada visita.
Ofrecemos cortes de cabello modernos, fragancias originales y ropa de tendencia para que siempre luzcas impecable.</p>
							<h3>¿Por qué elegirnos?</h3>
							<div className="list-style">
								<div className="col-lg-6 col-sm-6 col-xs-12">
									<ul>
										<li>Barbería profesional: cortes modernos, clásicos y personalizados.</li>
										<li>Moda urbana y casual: ropa de calidad con estilo actual.</li>
										<li>Calidad garantizada: trabajamos con productos auténticos.</li>
									</ul>
								</div>
								<div className="col-lg-6 col-sm-6 col-xs-12">
									<ul>
										<li>Perfumería original: fragancias exclusivas para todos los gustos.</li>
										<li>Atención personalizada: nos enfocamos en lo que realmente necesitas.</li>
										<li>Ubicación accesible: ven y encuentra todo en un mismo lugar.</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

About.propTypes = {
	data: PropTypes.shape({
		paragraph: PropTypes.string,
		Why: PropTypes.arrayOf(PropTypes.string),
		Why2: PropTypes.arrayOf(PropTypes.string),
	}),
};

About.defaultProps = {
	data: null,
};
