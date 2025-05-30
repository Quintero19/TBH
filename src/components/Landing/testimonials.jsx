import PropTypes from "prop-types";
import React from "react";

export const Testimonials = (props) => {
	return (
		<div id="testimonials">
			<div className="container">
				<div className="section-title text-center">
					<h2>What our clients say</h2>
				</div>
				<div className="row">
					{props.data
						? props.data.map((d, i) => (
								<div
									key={`${d.name}-${i}`}
									className="col-md-4"
									data-aos={i % 2 === 0 ? "slide-up" : "slide-down"}
									data-aos-delay={i * 100}
								>
									<div className="testimonial">
										<div className="testimonial-image">
											<img src={d.img} alt="" />
										</div>
										<div className="testimonial-content">
											<p>&quot;{d.text}&quot;</p>
											<div className="testimonial-meta"> - {d.name} </div>
										</div>
									</div>
								</div>
							))
						: "loading"}
				</div>
			</div>
		</div>
	);
};

Testimonials.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			img: PropTypes.string.isRequired,
			text: PropTypes.string.isRequired,
		}),
	),
};
