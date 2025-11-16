#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { render } from "./index.js";

function parseArgs(argv) {
	const args = {};
	for (let i = 2; i < argv.length; i += 1) {
		const a = argv[i];
		if (a === "--no-wrap") args.wrap = false;
		else if (a === "--no-color") args.color = false;
		else if (a === "--no-links") args.hyperlinks = false;
		else if (a === "--in") args.in = argv[++i];
		else if (a === "--out") args.out = argv[++i];
		else if (a === "--width") args.width = Number(argv[++i]);
		else if (a.startsWith("--theme=")) args.theme = a.split("=")[1];
	}
	return args;
}

function main() {
	const args = parseArgs(process.argv);
	const input =
		args.in && args.in !== "-"
			? fs.readFileSync(path.resolve(args.in), "utf8")
			: fs.readFileSync(0, "utf8");

	const output = render(input, {
		wrap: args.wrap,
		width: args.width,
		color: args.color,
		hyperlinks: args.hyperlinks,
		theme: args.theme,
	});

	if (args.out) {
		fs.writeFileSync(path.resolve(args.out), output, "utf8");
	} else {
		process.stdout.write(output);
	}
}

main();
