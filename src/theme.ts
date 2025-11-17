import type { ChalkInstance } from "chalk";
import { Chalk } from "chalk";
import type { StyleIntent, Theme } from "./types.js";

const base: Theme = {
	heading: { color: "yellow", bold: true },
	strong: { bold: true },
	emph: { italic: true },
	inlineCode: { color: "cyan" },
	blockCode: { color: "green" },
	link: { color: "blue", underline: true },
	quote: { dim: true },
	hr: { dim: true },
	listMarker: { color: "cyan" },
	tableHeader: { bold: true, color: "yellow" },
	tableCell: {},
};

const dim: Theme = {
	...base,
	heading: { color: "white", bold: true, dim: true },
	link: { color: "blue", underline: true, dim: true },
};

const bright: Theme = {
	...base,
	heading: { color: "magenta", bold: true },
	link: { color: "cyan", underline: true },
	inlineCode: { color: "green" },
	blockCode: { color: "green" },
};

export interface Themes {
	default: Theme;
	dim: Theme;
	bright: Theme;
	[key: string]: Theme;
}

export const themes: Themes = {
	default: Object.freeze(base),
	dim: Object.freeze(dim),
	bright: Object.freeze(bright),
};

export type Styler = (text: string, style?: StyleIntent) => string;

export function createStyler({ color }: { color: boolean }): Styler {
	const level = color ? 3 : 0;
	const chalk = new Chalk({ level }) as ChalkInstance;
	const apply: Styler = (text, style = {}) => {
		if (!color) return text;
		let fn: ChalkInstance = chalk;
		if (style.color) {
			const indexed = fn as unknown as Record<
				string,
				ChalkInstance | undefined
			>;
			if (indexed[style.color]) fn = indexed[style.color] as ChalkInstance;
		}
		if (style.bgColor) {
			const indexed = fn as unknown as Record<
				string,
				ChalkInstance | undefined
			>;
			if (indexed[style.bgColor]) fn = indexed[style.bgColor] as ChalkInstance;
		}
		if (style.bold) fn = fn.bold;
		if (style.italic) fn = fn.italic;
		if (style.underline) fn = fn.underline;
		if (style.dim) fn = fn.dim;
		if (style.strike) fn = fn.strikethrough;
		return fn(text);
	};
	return apply;
}
