import emailjs from "emailjs-com";
import PropTypes from "prop-types";
import React, { useState } from "react";

const initialState = {
	name: "",
	email: "",
	message: "",
};

export const Contact = (props) => {
	const [{ name, email, message }, setState] = useState(initialState);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setState((prevState) => ({ ...prevState, [name]: value }));
	};

	const clearState = () => setState({ ...initialState });

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(name, email, message);

		emailjs
			.sendForm(
				"YOUR_SERVICE_ID",
				"YOUR_TEMPLATE_ID",
				e.target,
				"YOUR_PUBLIC_KEY",
			)
			.then(
				(result) => {
					console.log(result.text);
					clearState();
				},
				(error) => {
					console.log(error.text);
				},
			);
	};

	return (
		<div>
			<div id="contact">
				<div className="container">
					{/* ... */}
					<form name="sentMessage" onSubmit={handleSubmit}>
						<div className="row">
							<div className="col-md-6">
								<input
									type="text"
									id="name"
									name="name"
									className="form-control"
									placeholder="Name"
									required
									onChange={handleChange}
									value={name}
								/>
							</div>
							<div className="col-md-6">
								<input
									type="email"
									id="email"
									name="email"
									className="form-control"
									placeholder="Email"
									required
									onChange={handleChange}
									value={email}
								/>
							</div>
						</div>
						<br />
						<textarea
							name="message"
							id="message"
							className="form-control"
							rows="4"
							placeholder="Message"
							required
							onChange={handleChange}
							value={message}
						/>
						<button type="submit" className="btn btn-custom btn-lg">
							Send Message
						</button>
					</form>
					{/* ... */}
					<div className="contact-info">
						<p>{props.data ? props.data.address : "Cargando..."}</p>
						<p>{props.data ? props.data.phone : "Cargando..."}</p>
						<p>{props.data ? props.data.email : "Cargando..."}</p>
					</div>
					<div className="social">
						<a href={props.data ? props.data.facebook : "/"}>
							<i className="fa fa-facebook" />
						</a>
						<a href={props.data ? props.data.twitter : "/"}>
							<i className="fa fa-twitter" />
						</a>
						<a href={props.data ? props.data.youtube : "/"}>
							<i className="fa fa-youtube" />
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

Contact.propTypes = {
	data: PropTypes.shape({
		address: PropTypes.string,
		phone: PropTypes.string,
		email: PropTypes.string,
		facebook: PropTypes.string,
		twitter: PropTypes.string,
		youtube: PropTypes.string,
	}),
};

Contact.defaultProps = {
	data: {
		address: "Loading...",
		phone: "Loading...",
		email: "Loading...",
		facebook: "/",
		twitter: "/",
		youtube: "/",
	},
};
