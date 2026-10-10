import { describe, expect, it } from 'vitest';
import { formatCount, formatCurrency, getInitials } from './utils';

describe('formatting helpers', () => {
  it('formats money as Kenyan shillings', () => {
    expect(formatCurrency(7500)).toMatch(/Ksh|KES/);
    expect(formatCurrency(7500)).toMatch(/7,500/);
  });

  it('shortens large counts', () => {
    expect(formatCount(950)).toBe('950');
    expect(formatCount(24000)).toBe('24K');
  });

  it('builds initials from a name', () => {
    expect(getInitials('Amani Demo')).toBe('AD');
    expect(getInitials('Baraka')).toBe('B');
  });
});
