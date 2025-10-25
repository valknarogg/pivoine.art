import { fromEvent } from "rxjs";
import { webComponentsReady, stylesheetReady } from "./common.js";

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

	await import(/* webpackMode: "eager" */ "fslightbox");

	const pushStateEl = document.querySelector("hy-push-state");
	const after$ = fromEvent(pushStateEl, "hy-push-state-after");

	after$.subscribe(() => {
		refreshFsLightbox();
	});
})();
