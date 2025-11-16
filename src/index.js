import { createRenderer, render as renderMarkdown } from "./render.js";

export { renderMarkdown as render, createRenderer };

export function strip(markdown, options = {}) {
	return renderMarkdown(markdown, {
		...options,
		color: false,
		hyperlinks: false,
	});
}
