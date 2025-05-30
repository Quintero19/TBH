import PropTypes from "prop-types";
import React from "react";
import "../../styles/css/Features.css";

export const Features = (props) => {
	return (
		<section id="features" className="features-section">
			<div className="container">
				<div className="col-md-10 col-md-offset-1 section-title">
					<h2>Features</h2>
				</div>
				<div className="row">
					{props.data
						? props.data.map((d, i) => (
								<div
									key={`${d.title}-${i}`}
									className="col-xs-6 col-md-3 feature-item"
									data-aos={i % 2 === 0 ? "fade-up" : "fade-down"}
									data-aos-delay={i * 100}
								>
									<i className={d.icon} />
									<h3>{d.title}</h3>
									<p>{d.text}</p>
								</div>
							))
						: "Loading..."}
				</div>
			</div>
		</section>
	);
};

Features.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			icon: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			text: PropTypes.string.isRequired,
		}),
	),
};
