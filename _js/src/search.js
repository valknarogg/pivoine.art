import { fromEvent, merge, timer, zip } from "rxjs";
import {
	tap,
	exhaustMap,
	map,
	mapTo,
	mergeMap,
	pairwise,
	share,
	startWith,
	switchMap,
	takeUntil,
	filter,
} from "rxjs/operators";
import { webComponentsReady, importTemplate, stylesheetReady } from "./common";

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

	const SEL_NAVBAR_BTN_BAR = "#_navbar > .content > .nav-btn-bar";

	const search = importTemplate("_search-template");
	const pushStateEl = document.querySelector("hy-push-state");

	if (!pushStateEl || !search) return;

	await import(/* webpackMode: "eager" */ "@honeymachine/search");

	const navbarEl = document.querySelector(SEL_NAVBAR_BTN_BAR);
	navbarEl?.insertBefore(search, navbarEl.querySelector(".nav-insert-marker"));

	const searchBtn = document.getElementById("_search");
	const searchEl = document.querySelector("hm-search");

	const documents = await fetch("/search.json").then((r) => r.json());

	searchEl.setAttribute("documents", JSON.stringify(documents));
	searchEl.setAttribute(
		"fields",
		JSON.stringify(["title", "description", "category", "tags"]),
	);

	const start$ = fromEvent(pushStateEl, "hy-push-state-start");
	const ready$ = fromEvent(pushStateEl, "hy-push-state-after");
	const search$ = fromEvent(searchEl, "search");
	const click$ = fromEvent(searchBtn, "click");

	let articles = (" " + document.getElementById("_main").innerHTML).slice(1);

	const reset = () => {
		const result = document.getElementById("_main");
		result.classList.remove("search-results");
		result.innerHTML = articles;
		result.querySelectorAll("img, h1").forEach((article) => {
			article.setAttribute("style", "opacity: 1;");
		});
	};

	start$.subscribe(() => {
		searchEl.clear();
		reset();
	});

	ready$.subscribe(() => {
		const result = document.getElementById("_main");
		if (result.innerHTML) {
			articles = (" " + result.innerHTML).slice(1);
		}
	});

	search$.subscribe((e) => {
		const result = document.getElementById("_main");
		const hits = e.detail;

		if (hits.length === 0) {
			reset();
		} else {
			result.classList.add("search-results");
			result.innerHTML = "";
			hits.forEach((hit) => {
				const item = documents.find((doc) => doc.id === hit.ref);
				const articleEl = document.createElement("article");
				articleEl.classList.add("search-result", "page", "post", "mb6");
				articleEl.setAttribute("role", "article");
				articleEl.setAttribute("id", "post-" + item.id);
				articleEl.innerHTML = `
<header>
  <h1 class="post-title flip-project-title">
    <a href="${item.url}" class="flip-title">${item.title}</a>
  </h1>
  <a
    href="${item.url}"
    class="no-hover no-print-link flip-project"
    tabindex="-1"
    >
    <div class="img-wrapper lead aspect-ratio sixteen-nine flip-project-img">
      <img
        src="${item.image}"
        alt="${item.title}"
        width="864"
        height="486"
        loading="lazy"
      />
    </div>
  </a>
  <p class="note-sm">
    ${item.description}
  </p>
</header>
`;

				result.appendChild(articleEl);
			});
		}
	});

	click$.subscribe(() => {
		searchEl.hidden = !searchEl.hidden;
		!searchEl.active ? searchEl.focus() : searchEl.clear();
		searchEl.setAttribute("aria-expanded", !searchEl.hidden);
	});
})();
