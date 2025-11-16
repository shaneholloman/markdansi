import supportsHyperlinks from 'supports-hyperlinks';

export function hyperlinkSupported(stream = process.stdout) {
  return supportsHyperlinks.stdout(stream);
}

export function osc8(url, text) {
  return `\u001B]8;;${url}\u0007${text}\u001B]8;;\u0007`;
}
