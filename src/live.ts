export type LiveRenderer = {
	render: (input: string) => void;
	finish: () => void;
};

export type LiveRendererOptions = {
	/**
	 * Function that converts the current full input into a rendered frame.
	 * Typically this is Markdansi's `render()` or an app-specific wrapper.
	 */
	renderFrame: (input: string) => string;
	/**
	 * Where to write ANSI output (usually `process.stdout.write.bind(process.stdout)`).
	 */
	write: (chunk: string) => void;
	/**
	 * Enable terminal "synchronized output" framing (DEC private mode 2026).
	 * Most terminals ignore this sequence if unsupported.
	 */
	synchronizedOutput?: boolean;
	/**
	 * Hide cursor during live updates.
	 */
	hideCursor?: boolean;
};

const BSU = "\u001b[?2026h";
const ESU = "\u001b[?2026l";
const HIDE_CURSOR = "\u001b[?25l";
const SHOW_CURSOR = "\u001b[?25h";
const CLEAR_LINE = "\u001b[2K";

function cursorUp(lines: number): string {
	if (lines <= 0) return "";
	return `\u001b[${lines}A`;
}

/**
 * Create a live renderer that repeatedly re-renders the entire buffer and redraws in-place.
 *
 * This is intentionally "terminal plumbing" and renderer-agnostic: you inject `renderFrame()`.
 */
export function createLiveRenderer(options: LiveRendererOptions): LiveRenderer {
	let previousLines = 0;
	let cursorHidden = false;

	const synchronizedOutput = options.synchronizedOutput !== false;
	const hideCursor = options.hideCursor !== false;

	const render = (input: string) => {
		const renderedRaw = options.renderFrame(input);
		const rendered = renderedRaw.endsWith("\n")
			? renderedRaw
			: `${renderedRaw}\n`;

		const lines = rendered.split("\n");
		if (lines.length > 0 && lines.at(-1) === "") lines.pop();

		const newLines = lines.length;
		const maxLines = Math.max(previousLines, newLines);

		let frame = "";
		if (hideCursor && !cursorHidden) {
			frame += HIDE_CURSOR;
			cursorHidden = true;
		}

		if (synchronizedOutput) frame += BSU;
		frame += previousLines > 0 ? `${cursorUp(previousLines)}\r` : "\r";

		for (let i = 0; i < maxLines; i += 1) {
			frame += CLEAR_LINE;
			frame += lines[i] ?? "";
			frame += "\n";
		}

		if (synchronizedOutput) frame += ESU;
		options.write(frame);

		previousLines = newLines;
	};

	const finish = () => {
		if (hideCursor && cursorHidden) {
			options.write(SHOW_CURSOR);
			cursorHidden = false;
		}
	};

	return { render, finish };
}
