import { createRenderer, render as renderMarkdown } from "./render.js";
import { themes } from "./theme.js";
import type { RenderOptions, Theme, ThemeName } from "./types.js";

export { renderMarkdown as render, createRenderer, themes };
export type { RenderOptions, Theme, ThemeName };

export function strip(markdown: string, options: RenderOptions = {}) {
	return renderMarkdown(markdown, {
		...options,
		color: false,
		hyperlinks: false,
	});
}
