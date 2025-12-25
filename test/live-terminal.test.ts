import { Terminal } from "@xterm/headless";
import { describe, expect, it } from "vitest";
import { createLiveRenderer, render, strip } from "../src/index.js";

const flushTerminal = (term: Terminal) =>
	new Promise<void>((resolve) => {
		term.write("", () => resolve());
	});

function normalizeLines(lines: string[]): string[] {
	const out = [...lines];
	while (out.length > 0 && out[out.length - 1] === "") out.pop();
	return out;
}

function readTerminalLines(term: Terminal): string[] {
	const buffer = term.buffer.active;
	const lines: string[] = [];
	for (let row = 0; row < term.rows; row += 1) {
		const line = buffer.getLine(row);
		const text = line ? line.translateToString(true) : "";
		if (line?.isWrapped && lines.length > 0) {
			lines[lines.length - 1] += text;
			continue;
		}
		lines.push(text);
	}
	return normalizeLines(lines);
}

function expectedLines(markdown: string, cols: number): string[] {
	const plain = strip(markdown, { width: cols, wrap: true, hyperlinks: false });
	return normalizeLines(plain.split("\n"));
}

describe("live renderer terminal integration", () => {
	it("reflows paragraphs without leaving stale lines", async () => {
		const cols = 26;
		const term = new Terminal({
			cols,
			rows: 10,
			scrollback: 0,
			allowProposedApi: true,
		});
		const live = createLiveRenderer({
			width: cols,
			write: (chunk) => {
				term.write(chunk);
			},
			renderFrame: (markdown) =>
				render(markdown, { width: cols, wrap: true, hyperlinks: true }),
		});

		const md1 =
			"# Executive Summary\n\nThis is a **bold** statement about [links](https://example.com).";
		const md2 = `${md1} It grows and reflows when streaming adds more words.`;

		live.render(md1);
		await flushTerminal(term);
		expect(readTerminalLines(term)).toEqual(expectedLines(md1, cols));

		live.render(md2);
		await flushTerminal(term);
		expect(readTerminalLines(term)).toEqual(expectedLines(md2, cols));
	});

	it("clears removed lines when the frame shrinks", async () => {
		const cols = 24;
		const term = new Terminal({
			cols,
			rows: 8,
			scrollback: 0,
			allowProposedApi: true,
		});
		const live = createLiveRenderer({
			width: cols,
			write: (chunk) => {
				term.write(chunk);
			},
			renderFrame: (markdown) =>
				render(markdown, { width: cols, wrap: true, hyperlinks: false }),
		});

		const md1 = "# Title\n\nLine one.\nLine two.\nLine three.";
		const md2 = "# Title\n\nLine one.";

		live.render(md1);
		await flushTerminal(term);
		expect(readTerminalLines(term)).toEqual(expectedLines(md1, cols));

		live.render(md2);
		await flushTerminal(term);
		expect(readTerminalLines(term)).toEqual(expectedLines(md2, cols));
	});

	it("handles long unbroken tokens that soft-wrap", async () => {
		const cols = 18;
		const term = new Terminal({
			cols,
			rows: 8,
			scrollback: 0,
			allowProposedApi: true,
		});
		const live = createLiveRenderer({
			width: cols,
			write: (chunk) => {
				term.write(chunk);
			},
			renderFrame: (markdown) =>
				render(markdown, { width: cols, wrap: true, hyperlinks: false }),
		});

		const md1 =
			"Softwrap check:\n\nsupercalifragilisticexpialidocious\n\nend.";
		const md2 = "Softwrap check:\n\nsupercalifragilisticexpialidocious.";

		live.render(md1);
		await flushTerminal(term);
		expect(readTerminalLines(term)).toEqual(expectedLines(md1, cols));

		live.render(md2);
		await flushTerminal(term);
		expect(readTerminalLines(term)).toEqual(expectedLines(md2, cols));
	});
});
