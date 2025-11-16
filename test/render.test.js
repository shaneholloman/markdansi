import { describe, it, expect } from 'vitest';
import { render, strip } from '../src/index.js';

const noColor = { color: false, hyperlinks: false, wrap: true, width: 40 };

describe('inline formatting', () => {
  it('renders emphasis/strong/code/strike', () => {
    const out = strip('Hello _em_ **strong** `code` ~~gone~~', noColor);
    expect(out).toContain('Hello em strong code gone');
  });
});

describe('wrapping', () => {
  it('wraps paragraphs at width', () => {
    const out = strip('one two three four five six seven eight nine ten', {
      ...noColor,
      width: 10,
    });
    const lines = out.split('\n');
    expect(lines[0].length).toBeLessThanOrEqual(10);
  });

  it('respects no-wrap', () => {
    const out = strip('one two three four five six seven eight nine ten', {
      ...noColor,
      wrap: false,
      width: 5,
    });
    expect(out.split('\n')[0].length).toBeGreaterThan(20);
  });
});

describe('lists and tasks', () => {
  it('renders task list items', () => {
    const out = strip('- [ ] open\n- [x] done', noColor);
    expect(out).toContain('[ ] open');
    expect(out).toContain('[x] done');
  });
});

describe('tables', () => {
  it('renders gfm tables', () => {
    const md = `
| h1 | h2 |
| --- | --- |
| a | b |
`;
    const out = strip(md, { ...noColor, width: 30 });
    expect(out).toContain('| h1 | h2 |');
  });
});

describe('hyperlinks', () => {
  it('adds url suffix when hyperlinks are off', () => {
    const out = strip('[link](https://example.com)', { ...noColor });
    expect(out).toContain('link (https://example.com)');
  });
});
