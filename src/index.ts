import type { LiveRenderer, LiveRendererOptions } from "./live.js";
import { createLiveRenderer } from "./live.js";
import { createRenderer, render as renderMarkdown } from "./render.js";
import { themes } from "./theme.js";
import type { RenderOptions, Theme, ThemeName } from "./types.js";

export { createLiveRenderer, createRenderer, renderMarkdown as render, themes };
export type { RenderOptions, Theme, ThemeName };
export type { LiveRenderer, LiveRendererOptions };

/**
 * Render Markdown to plain text (no ANSI, no hyperlinks) while preserving layout/wrapping.
 */
export function strip(markdown: string, options: RenderOptions = {}) {
	return renderMarkdown(markdown, {
		...options,
		color: false,
		hyperlinks: false,
		// ensure flags like codeWrap/tableTruncate not lost
		wrap: options.wrap ?? true,
	});
}
