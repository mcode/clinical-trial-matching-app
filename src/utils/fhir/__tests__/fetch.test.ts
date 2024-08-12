import { createMockFhirClient, createRequestSpy } from '@/__mocks__/fhirClient';
import { compareDates, createQueryConfig, fetchBundles, parseFHIRDate } from '../fetch';

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

describe('createQueryConfig()', () => {
  it('returns undefined for an unset entry', () => {
    delete process.env['FHIR_QUERY_TESTSCRIPT'];
    expect(createQueryConfig('TestScript')).toBeUndefined();
  });

  it('returns the configured value', () => {
    process.env['FHIR_QUERY_TESTSCRIPT'] = 'category=test&other=thing';
    expect(createQueryConfig('TestScript')).toEqual({ category: 'test', other: 'thing' });
  });
});

describe('fetchBundles()', () => {
  it('adds parameters to the query', async () => {
    const requestSpy = createRequestSpy();
    const fhirClient = createMockFhirClient({ request: requestSpy });
    await fetchBundles(fhirClient, 'TestScript', { test: 'parameters' });
    expect(requestSpy).toHaveBeenCalledWith('TestScript?patient=test-patient&test=parameters', { pageLimit: 0 });
  });
  it('adds nothing to the query if no parameters are given', async () => {
    const requestSpy = createRequestSpy();
    const fhirClient = createMockFhirClient({ request: requestSpy });
    await fetchBundles(fhirClient, 'TestScript');
    expect(requestSpy).toHaveBeenCalledWith('TestScript?patient=test-patient', { pageLimit: 0 });
  });
});
