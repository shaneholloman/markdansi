import { describe, expect, it } from "vitest";
import { createLiveRenderer } from "../src/live.js";

describe("live renderer", () => {
	it("emits synchronized frames with cursor control sequences", () => {
		const writes: string[] = [];
		const live = createLiveRenderer({
			write: (chunk) => writes.push(chunk),
			renderFrame: (input) => input,
		});

		live.render("hello");
		live.render("hello\nworld");
		live.finish();

		const out = writes.join("");
		expect(out).toContain("\u001b[?2026h");
		expect(out).toContain("\u001b[?2026l");
		expect(out).toContain("\u001b[2K");
		expect(out).toContain("\u001b[?25l");
		expect(out).toContain("\u001b[?25h");
		expect(out).toContain("\u001b[1A\r");
	});

	it("can disable synchronized output framing", () => {
		const writes: string[] = [];
		const live = createLiveRenderer({
			write: (chunk) => writes.push(chunk),
			renderFrame: (input) => input,
			synchronizedOutput: false,
		});

		live.render("hello");
		live.finish();

		const out = writes.join("");
		expect(out).not.toContain("\u001b[?2026h");
		expect(out).not.toContain("\u001b[?2026l");
		expect(out).toContain("\u001b[2K");
	});
});
