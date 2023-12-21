import { Practitioner } from 'fhir/r4';
import { findContainedResourceById } from '../fhirUtils';

describe('findContainedResourceById', () => {
  it('returns undefined if there are no contained resources', () => {
    expect(
      findContainedResourceById<Practitioner>(
        { resourceType: 'ResearchStudy', status: 'active' },
        'Practitioner',
        'anything'
      )
    ).toBeUndefined();
  });
});
