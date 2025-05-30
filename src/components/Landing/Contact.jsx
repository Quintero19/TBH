import emailjs from "emailjs-com";
import { useState } from "react";
import React from "react";

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
					<div className="col-md-8" data-aos="fade-up" data-aos-delay="100">
						<div className="row">
							<div className="section-title">
								<h2>Get In Touch</h2>
								<p>
									Please fill out the form below to send us an email and we will
									get back to you as soon as possible.
								</p>
							</div>
							<form name="sentMessage" onSubmit={handleSubmit}>
								<div className="row">
									<div className="col-md-6">
										<div className="form-group">
											<input
												type="text"
												id="name"
												name="name"
												className="form-control"
												placeholder="Name"
												required
												onChange={handleChange}
											/>
											<p className="help-block text-danger" />
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group">
											<input
												type="email"
												id="email"
												name="email"
												className="form-control"
												placeholder="Email"
												required
												onChange={handleChange}
											/>
											<p className="help-block text-danger" />
										</div>
									</div>
								</div>
								<div className="form-group">
									<textarea
										name="message"
										id="message"
										className="form-control"
										rows="4"
										placeholder="Message"
										required
										onChange={handleChange}
									/>
									<p className="help-block text-danger" />
								</div>
								<div id="success" />
								<button type="submit" className="btn btn-custom btn-lg">
									Send Message
								</button>
							</form>
						</div>
					</div>
					<div
						className="col-md-3 col-md-offset-1 contact-info"
						data-aos="fade-down"
						data-aos-delay="200"
					>
						<div className="contact-item">
							<h3>Contact Info</h3>
							<p>
								<span>
									<i className="fa fa-map-marker" /> Address
								</span>
								{props.data ? props.data.address : "loading"}
							</p>
						</div>
						<div className="contact-item">
							<p>
								<span>
									<i className="fa fa-phone" /> Phone
								</span>{" "}
								{props.data ? props.data.phone : "loading"}
							</p>
						</div>
						<div className="contact-item">
							<p>
								<span>
									<i className="fa fa-envelope-o" /> Email
								</span>{" "}
								{props.data ? props.data.email : "loading"}
							</p>
						</div>
					</div>
					<div className="col-md-12">
						<div className="row">
							<div className="social">
								<ul>
									<li>
										<a href={props.data ? props.data.facebook : "/"}>
											<i className="fa fa-facebook" />
										</a>
									</li>
									<li>
										<a href={props.data ? props.data.twitter : "/"}>
											<i className="fa fa-twitter" />
										</a>
									</li>
									<li>
										<a href={props.data ? props.data.youtube : "/"}>
											<i className="fa fa-youtube" />
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="footer">
				<div className="container text-center">
					<p>
						&copy; 2023 Issaaf Kattan React Land Page Template. Design by{" "}
						<a href="http://www.templatewire.com" rel="nofollow">
							TemplateWire
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};
