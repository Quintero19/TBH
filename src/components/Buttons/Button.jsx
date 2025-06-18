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
		blue: "bg-blue-500 hover:bg-blue-700 rounded-full flex items-center justify-center",
		green: "bg-green-500 border-green-700 hover:bg-green-700",
		red: "bg-red-500 hover:bg-red-700 rounded-full flex items-center justify-center",
		orange:
			"bg-orange-400 border-orange-700 hover:bg-orange-700  rounded-full flex items-center justify-center",
		gray: "bg-gray-500 border-gray-400 hover:bg-gray-600 cursor-not-allowed",
	};
	const colorKey = Object.keys(colors).find((key) =>
    className.split(" ").includes(key)
  	);
	const colorClass = colors[colorKey] || colors.gray;

	const buttonClasses = `${baseClasses} ${colorClass} ${className
    .split(" ")
    .filter((c) => c !== colorKey)
    .join(" ")}`;

	const content = (
		<span className="flex items-center gap-x-3">
			{icon && <i className={`fa ${icon} text-3xl`} />}
			{children}
		</span>
	);

	return href ? (
		<a href={href} className={`${buttonClasses} text-center`} {...props}>
			{content}
		</a>
	) : (
		<button
			type={type}
			className={`${buttonClasses} text-center ${
				props.disabled ? "opacity-50 !cursor-not-allowed" : ""
			}`}
			disabled={props.disabled}
			{...props}
		>
			{content}
		</button>
	);
};

Button.propTypes = {
	href: PropTypes.string,
	type: PropTypes.string,
	icon: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.node.isRequired,
	disabled: PropTypes.bool,
};

export default Button;
