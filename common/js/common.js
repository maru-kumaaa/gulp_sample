//  --------------------------------
// 375px viewport fixed ------------
//  --------------------------------
const switchViewport = () => {
	const viewport = document.querySelector('meta[name="viewport"]');
	const value =
		window.outerWidth > 375 ? "width=device-width,initial-scale=1" : "width=375";
	if (viewport.getAttribute("content") !== value) {
		viewport.setAttribute("content", value);
	}
};
const addResizeListener = () => {
	window.addEventListener("resize", switchViewport, false);
};

switchViewport();
addResizeListener();

//  --------------------------------
// smooth scroll -------------------
//  --------------------------------
const smoothScroll = () => {
	const h = document.querySelector("header");
	const links = document.querySelectorAll('a[href^="#"]');

	links.forEach(function (a) {
		a.addEventListener("click", function (e) {
			e.preventDefault();
			gsap.to(window, {
				duration: 1,
				ease: "power2.out",
				scrollTo: {
					y: a.getAttribute("href"), // 修正点
					autoKill: false,
					offsetY: h.offsetHeight,
				},
			});
		});
	});
};

smoothScroll();
