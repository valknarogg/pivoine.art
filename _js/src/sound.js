import { fromEvent } from "rxjs";
import { webComponentsReady, stylesheetReady } from "./common.js";
import { Wave } from "@foobar404/wave";

(async () => {
	await Promise.all([
		...("customElements" in window
			? []
			: [
					import(
						/* webpackChunkName: "webcomponents" */ "./polyfills/webcomponents.js"
					).then(
						() =>
							import(
								/* webpackChunkName: "shadydom" */ "./polyfills/shadydom.js"
							),
					),
				]),
	]);

	await webComponentsReady;
	await stylesheetReady;

	const sound = document.querySelector(".sound-player");

	if (!sound) return;

	const fallback = JSON.parse(sound.getAttribute("data-featured"));
	let featured = fallback;
	let currentIndex = undefined;

	const randomTrackIndex = () =>
		Math.floor(Math.random() * (featured.tracks.length - 1));

	const updateTrack = (index, active) => {
		if (index != null) {
			const track = featured.tracks[index];
			audioElement.setAttribute(
				"src",
				`/assets/sounds/${featured.slug}/${track}`,
			);
			currentIndex = index;
		}

		if (active) {
			const track = featured.tracks[currentIndex];
			buttonElement.textContent = `[ ${track.substring(0, track.lastIndexOf("."))} ]`;
			audioElement.play();
			canvasElement.classList.remove("hidden");
		} else {
			buttonElement.textContent = "[ SOUND ON ]";
			audioElement.pause();
			canvasElement.classList.add("hidden");
		}
	};

	const updateSound = () => {
		const sound = document.querySelector(".sound-wrapper");

		if (!sound) return;

		featured = JSON.parse(sound.getAttribute("data-featured"));
		updateTrack(0, !audioElement.paused);

		const buttons = document.querySelectorAll(".sound-wrapper .sound-item");
		buttons.forEach((button, i) => {
			fromEvent(button, "click").subscribe((event) => {
				event.preventDefault();
				updateTrack(i, true);
			});
		});
	};

	const audioElement = document.querySelector(".sound-player audio");
	const buttonElement = document.querySelector(".sound-player a");
	const canvasElement = document.querySelector(".sound-player canvas");
	const pushStateEl = document.querySelector("hy-push-state");
	const wave = new Wave(audioElement, canvasElement);

	wave.addAnimation(
		new wave.animations.Arcs({
			lineColor: {
				gradient: [
					"#d16ba5",
					"#c777b9",
					"#ba83ca",
					"#aa8fd8",
					"#9a9ae1",
					"#8aa7ec",
					"#79b3f4",
					"#69bff8",
					"#52cffe",
					"#41dfff",
					"#46eefa",
					"#5ffbf1",
				],
				rotate: 45,
			},
			lineWidth: 10,
			diameter: 4,
			count: 20,
			frequencyBand: "lows",
		}),
	);

	fromEvent(buttonElement, "click").subscribe(() => {
		updateTrack(undefined, audioElement.paused);
	});

	fromEvent(audioElement, "ended").subscribe(() => {
		updateTrack(randomTrackIndex(), true);
	});

	fromEvent(pushStateEl, "hy-push-state-after").subscribe(() => {
		updateSound();
	});

	updateTrack(randomTrackIndex(), false);
	updateSound();
})();
