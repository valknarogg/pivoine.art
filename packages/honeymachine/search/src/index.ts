/**
 * Copyright (c) 2025 Sebastian Krüger <https://honeymachine.io/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @license
 * @nocompile
 */
import { html } from "lit";
import {
	customElement,
	property,
	query,
	eventOptions,
} from "lit/decorators.js";
import { RxLitElement } from "@hydecorp/component";
import lunr from "lunr";
import { applyMixins } from "./common";
import { styles } from "./styles";
import { Key } from "readline";

@customElement("hm-search")
export class HmSearch extends applyMixins(RxLitElement, []) {
	static styles = styles;

	@query(".hm-search-input") inputEl!: HTMLInputElement;

	@property({ type: String, reflect: true }) placeholder: string = "Search...";
	@property({ type: Array, reflect: true }) documents: Array<any> = [];
	@property({ type: Array, reflect: true }) fields: Array<string> = [];

	idx!: lunr.Index;

	constructor() {
		super();
	}

	handleKeyup(e: KeyboardEvent) {
		if (e.key === "Escape") {
			this.clear();
			return;
		}
		const query = this.inputEl.value;
		if (!query) {
			this.fireEvent("search", { detail: [] });
			return;
		}
		this.fireEvent("search", { detail: this.idx.search(query) });
	}

	updated(): void {
		const documents = this.documents;
		const fields = this.fields;
		this.idx = lunr(function () {
			fields.forEach((field) => {
				this.field(field);
			});

			documents.forEach((doc) => {
				this.add(doc);
			});
		});
	}

	render() {
		return html`
      <div class="hm-search">
        <input class="hm-search-input" type="text" placeholder="${this.placeholder}" name="hm-search-input" @keyup="${this.handleKeyup}" />
      </div>
    `;
	}

	focus() {
		this.inputEl.focus();
	}

	clear() {
		this.inputEl.value = "";
		this.fireEvent("search", { detail: [] });
	}

	get active() {
		return this.inputEl === document.activeElement;
	}
}
