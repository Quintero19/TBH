import PropTypes from "prop-types";
import React from "react";

export const Team = (props) => {
	return (
		<div id="team" className="text-center">
			<div className="container">
				<div className="col-md-8 col-md-offset-2 section-title">
					<h2>Meet the Team</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit duis sed
						dapibus leonec.
					</p>
				</div>
				<div id="row">
					{props.data
						? props.data.map((d, i) => (
								<div
									key={`${d.name}-${i}`}
									className="col-md-3 col-sm-6 team"
									data-aos={i % 2 === 0 ? "fade-right" : "fade-left"}
									data-aos-delay={i * 100}
								>
									<div className="thumbnail">
										<img src={d.img} alt="..." className="team-img" />
										<div className="caption">
											<h4>{d.name}</h4>
											<p>{d.job}</p>
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

Team.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			img: PropTypes.string.isRequired,
			job: PropTypes.string.isRequired,
		}),
	),
};
