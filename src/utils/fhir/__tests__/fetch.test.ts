import { parseFHIRDate, compareDates } from '../fetch';

describe('compareDates()', () => {
  it('compares undefined after other dates', () => {
    expect(compareDates('2024-01-01', undefined)).toEqual(-1);
    expect(compareDates(undefined, '2024-01-01')).toEqual(1);
    expect(compareDates(undefined, undefined)).toEqual(0);
  });

  it('compares dates', () => {
    expect(compareDates('2024-01-01T12:00:00Z', '2024-01-02T12:00:00Z')).toEqual(1);
    expect(compareDates('2024-01-03T12:00:00Z', '2024-01-02T12:00:00Z')).toEqual(-1);
  });
});

describe('parseFHIRDate()', () => {
  it('parses just the year', () => {
    expect(parseFHIRDate('2004')).toEqual(Date.UTC(2004, 0, 1));
  });
  it('parses year and month', () => {
    expect(parseFHIRDate('2004-03')).toEqual(Date.UTC(2004, 2, 1));
  });
  it('parses year, month and date', () => {
    expect(parseFHIRDate('2004-03-15')).toEqual(Date.UTC(2004, 2, 15));
  });
  it('parses year, month, date, and time', () => {
    expect(parseFHIRDate('2004-03-15T15:23:49Z')).toEqual(Date.UTC(2004, 2, 15, 15, 23, 49));
  });
  it('parses year, month, date, and time with milliseconds', () => {
    expect(parseFHIRDate('2004-03-15T15:23:49.578Z')).toEqual(Date.UTC(2004, 2, 15, 15, 23, 49, 578));
  });
  it('parses a date with an explicit timezone', () => {
    expect(parseFHIRDate('2004-03-15T15:23:49-04:00')).toEqual(Date.UTC(2004, 2, 15, 19, 23, 49));
  });
});
