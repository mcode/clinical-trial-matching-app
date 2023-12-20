import { getSponsor, getType } from '../utils';

describe('getSponsor()', () => {
  it('handles an empty research study', () => {
    const result = getSponsor({
      resourceType: 'ResearchStudy',
      status: 'active',
    });
    expect(result).not.toBeDefined();
  });
  it('find the referenced sponsor', () => {
    const result = getSponsor({
      resourceType: 'ResearchStudy',
      status: 'active',
      sponsor: {
        reference: '#sponsor',
      },
      contained: [
        {
          resourceType: 'Organization',
          id: 'sponsor',
          name: 'Test Organization',
          telecom: [
            {
              system: 'email',
              value: 'test@example.com',
            },
          ],
        },
      ],
    });
    expect(result).toBeDefined();
    expect(result?.name).toEqual('Test Organization');
    expect(result?.email).toEqual('test@example.com');
  });
});

describe('getType()', () => {
  it('handles an empty research study', () => {
    const result = getType({
      resourceType: 'ResearchStudy',
      status: 'active',
    });
    expect(result).toEqual({ name: 'Unknown Study Type' });
  });
  it('returns the expected study type', () => {
    const result = getType({
      resourceType: 'ResearchStudy',
      status: 'active',
      category: [
        {
          text: 'Study Type: Demo Study',
        },
      ],
    });
    expect(result).toEqual({ name: 'Demo Study', label: 'Demo Study' });
  });
  it('removes unexpected characters from the name', () => {
    const result = getType({
      resourceType: 'ResearchStudy',
      status: 'active',
      category: [
        {
          text: 'Study Type: [Demo.Study]',
        },
      ],
    });
    expect(result).toEqual({ name: '(DemoStudy)', label: '[Demo.Study]' });
  });
  it('skips unknown categories', () => {
    const result = getType({
      resourceType: 'ResearchStudy',
      status: 'active',
      category: [
        {
          text: 'Ignore this.',
        },
        {
          text: 'Study Type:',
        },
        {
          text: 'Study Type:No space',
        },
        {
          text: 'Study Type: Expected Result',
        },
      ],
    });
    expect(result).toEqual({ name: 'Expected Result', label: 'Expected Result' });
  });
});
