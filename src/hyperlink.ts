import type { WriteStream } from "node:tty";
import supportsHyperlinks from "supports-hyperlinks";

/**
 * Detect OSC-8 hyperlink support for a given stream (defaults to stdout).
 */
export function hyperlinkSupported(
	stream: WriteStream = process.stdout,
): boolean {
	const helper = supportsHyperlinks as unknown as {
		stdout?: (s: WriteStream) => boolean;
	};
	if (helper.stdout) return helper.stdout(stream);
	return false;
}

export function osc8(url: string, text: string): string {
	return `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;
}
