import SmoothScroll from "smooth-scroll";

export const scroll = new SmoothScroll('a[href*="#"]', {
	speed: 1500,
	speedAsDuration: true,
});
