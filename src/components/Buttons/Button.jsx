import PropTypes from "prop-types";
import React from "react";

const Button = ({
	href,
	type = "button",
	icon,
	className = "",
	children,
	...props
}) => {
	const baseClasses =
		"px-5 py-3 rounded-full font-bold transition duration-300 text-white";
	const colors = {
		blue_a:
			"bg-blue-500 hover:bg-blue-700 h-[35px] w-[43px] rounded-full flex items-center justify-center",
		blue_b: "bg-blue-500 border-blue-700 hover:bg-blue-700",
		green: "bg-green-500 border-green-700 hover:bg-green-700",
		red: "bg-red-500 border-red-700 hover:bg-red-700",
		orange_a:
			"bg-orange-400 border-orange-700 hover:bg-orange-700 h-[35px] w-[43px] rounded-full flex items-center justify-center",
		orange_b: "bg-orange-400 border-orange-700 hover:bg-orange-700",
		gray: "bg-gray-500 border-gray-400 hover:bg-gray-600 cursor-not-allowed",
	};

	const buttonClasses = `${baseClasses} ${
		colors[className] || "bg-gray-400 border-gray-400"
	}`;

	return href ? (
		<a href={href} className={`${buttonClasses} text-center`} {...props}>
			{icon && <i className={`fas ${icon}`} />}
			{children}
		</a>
	) : (
		<button
			type={type}
			className={`${buttonClasses} text-center ${
				props.disabled ? "opacity-50 cursor-not-allowed" : ""
			}`}
			disabled={props.disabled}
			{...props}
		>
			{icon && <i className={`fas ${icon}`} />}
			{children}
		</button>
	);
};

Button.propTypes = {
	href: PropTypes.string,
	type: PropTypes.string,
	icon: PropTypes.node,
	className: PropTypes.string,
	children: PropTypes.node.isRequired,
	disabled: PropTypes.bool,
};

export default Button;
