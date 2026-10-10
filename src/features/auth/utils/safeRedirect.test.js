import { describe, expect, it } from 'vitest';
import { safeRedirect } from './safeRedirect';

describe('safeRedirect', () => {
  it.each([
    '/brand/enquiries',
    '/c/amani',
    '/c/amani?tab=packages',
    '/creator/rate-card/123/edit',
  ])('keeps the in-app path %s', (path) => {
    expect(safeRedirect(path)).toBe(path);
  });

  it.each([
    ['another site', 'https://evil.com'],
    ['a protocol-relative url', '//evil.com'],
    ['a backslash trick', '/\\evil.com'],
    ['a double backslash', '/\\\\evil.com'],
    ['a javascript: url', 'javascript:alert(1)'],
    ['a newline', '/ok\nnext'],
    ['a tab', '/ok\tnext'],
    ['an empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['a number', 42],
  ])('drops %s', (_label, value) => {
    expect(safeRedirect(value)).toBeNull();
  });
});
