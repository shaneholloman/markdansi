#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { render } from "./index.js";
import type { RenderOptions, ThemeName } from "./types.js";

type CliArgs = Partial<RenderOptions> & {
	in?: string;
	out?: string;
	help?: boolean;
};

function parseArgs(argv: string[]): CliArgs {
	const args: CliArgs = {};
	for (let i = 2; i < argv.length; i += 1) {
		const a = argv[i];
		if (!a) continue;
		if (a === "--no-wrap") args.wrap = false;
		else if (a === "--no-color") args.color = false;
		else if (a === "--no-links") args.hyperlinks = false;
		else if (a === "--in") {
			const next = argv[i + 1];
			if (next) args.in = next;
			i += 1;
		} else if (a === "--out") {
			const next = argv[i + 1];
			if (next) args.out = next;
			i += 1;
		} else if (a === "--width") {
			const next = argv[i + 1];
			if (next) args.width = Number(next);
			i += 1;
		} else if (a.startsWith("--theme=")) {
			const themeVal = a.split("=")[1];
			if (themeVal) args.theme = themeVal as ThemeName;
		} else if (a === "--list-indent") {
			const next = argv[i + 1];
			if (next) args.listIndent = Number(next);
			i += 1;
		} else if (a === "--quote-prefix") {
			const next = argv[i + 1];
			if (next) args.quotePrefix = next;
			i += 1;
		} else if (a === "--help" || a === "-h") args.help = true;
	}
	return args;
}

function main(): void {
	const args = parseArgs(process.argv);
	if (args.help) {
		process.stdout.write(`markdansi options:
  --in FILE           Input file (default: stdin)
  --out FILE          Output file (default: stdout)
  --width N           Wrap width (default: TTY cols or 80)
  --no-wrap           Disable hard wrapping
  --no-color          Disable ANSI/OSC output
  --no-links          Disable OSC-8 hyperlinks
  --theme NAME        Theme (default|dim|bright)
  --list-indent N     Spaces per list nesting level (default: 2)
  --quote-prefix STR  Prefix for blockquotes (default: "│ ")
`);
		process.exit(0);
	}
	const input =
		args.in && args.in !== "-"
			? fs.readFileSync(path.resolve(args.in), "utf8")
			: fs.readFileSync(0, "utf8");

	const renderOptions: RenderOptions = {
		...(args.wrap !== undefined ? { wrap: args.wrap } : {}),
		...(args.width !== undefined ? { width: args.width } : {}),
		...(args.color !== undefined ? { color: args.color } : {}),
		...(args.hyperlinks !== undefined ? { hyperlinks: args.hyperlinks } : {}),
		...(args.theme !== undefined ? { theme: args.theme } : {}),
		...(args.listIndent !== undefined ? { listIndent: args.listIndent } : {}),
		...(args.quotePrefix !== undefined
			? { quotePrefix: args.quotePrefix }
			: {}),
	};

	const output = render(input, renderOptions);

	if (args.out) {
		fs.writeFileSync(path.resolve(args.out), output, "utf8");
	} else {
		process.stdout.write(output);
	}
}

main();
