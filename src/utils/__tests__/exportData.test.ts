import { ResearchStudy } from 'fhir/r4';
import { exportSpreadsheetData, unpackStudies } from '../exportData';
import FileSaver from 'file-saver';

describe('unpackStudies', () => {
  it('works on an empty array', () => {
    expect(unpackStudies([])).toEqual(expect.arrayContaining([expect.objectContaining({ 'Match Count': '0' })]));
  });

  it('works on an almost empty ResearchStudy', () => {
    expect(
      unpackStudies([
        {
          fullUrl: 'http://www.example.com/',
          resource: {
            resourceType: 'ResearchStudy',
          } as ResearchStudy,
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 'Match Count': '1' }),
        expect.objectContaining({
          'Match Likelihood': 'Unknown likelihood',
          Conditions: '[]',
        }),
      ])
    );
  });

  it('exports sites', () => {
    expect(
      unpackStudies([
        {
          fullUrl: 'http://www.example.com/',
          resource: {
            resourceType: 'ResearchStudy',
            id: 'ID',
            title: 'Example Research Study',
            description: 'A test research study object for testing this feature.',
            identifier: [
              {
                use: 'official',
                system: 'http://clinicaltrials.gov',
                value: 'EXAMPLE',
              },
            ],
            status: 'active',
            phase: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/research-study-phase',
                  code: 'active',
                  display: 'Active',
                },
              ],
              text: 'Active',
            },
            category: [{ text: 'Study Type: Example Type' }],
            contact: [
              {
                name: 'Example Contact',
                telecom: [
                  {
                    system: 'phone',
                    value: '781-555-0100',
                    use: 'work',
                  },
                  {
                    system: 'email',
                    value: 'email@example.com',
                    use: 'work',
                  },
                ],
              },
            ],
            enrollment: [
              {
                reference: '#group1',
                type: 'Group',
                display: 'Example Criteria',
              },
            ],
            sponsor: {
              reference: '#org1',
              type: 'Organization',
            },
            contained: [
              {
                resourceType: 'Group',
                id: 'group1',
                type: 'person',
                actual: false,
              },
              {
                resourceType: 'Organization',
                id: 'org1',
                name: 'Example Sponsor Organization',
              },
              {
                resourceType: 'Location',
                id: 'location-1',
                name: 'First Location',
                telecom: [
                  {
                    system: 'phone',
                    value: '123456789',
                    use: 'work',
                  },
                ],
              },
              {
                resourceType: 'Location',
                id: 'location-2',
                name: 'Second Location',
                telecom: [
                  {
                    system: 'email',
                    value: 'email@example.com',
                    use: 'work',
                  },
                ],
              },
            ],
            site: [
              {
                reference: '#location-1',
                type: 'Location',
              },
              {
                reference: '#location-2',
                type: 'Location',
              },
            ],
            condition: [{ text: 'condition-1' }, { text: 'condition-2' }],
            period: {
              start: '2021-1-2',
              end: '2021-3-4',
            },
          },
          search: {
            mode: 'match',
            score: 0.74,
          },
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 'Match Count': '1' }),
        expect.objectContaining({
          'Trial Id': 'EXAMPLE',
          Description: 'A test research study object for testing this feature.',
          Eligibility: 'Example Criteria',
          'Match Likelihood': 'Possible match',
          Period: 'Jan 2, 2021 - Mar 4, 2021',
          Title: 'Example Research Study',
          'Overall Status': 'active',
          Phase: 'Active',
          Conditions: '["condition-1","condition-2"]',
          'Study Type': 'Example Type',
          Sponsor: 'Example Sponsor Organization',
          'Overall Contact': 'Example Contact',
          'Overall Contact Phone': '781-555-0100',
          'Overall Contact Email': 'email@example.com',
        }),
        expect.objectContaining({ Facility: 'First Location', Phone: '123456789' }),
        expect.objectContaining({
          Facility: 'Second Location',
          Email: 'email@example.com',
        }),
      ])
    );
  });
});

describe('exportSpreadsheetData', () => {
  it('should export data', () => {
    const saverSpy = jest.spyOn(FileSaver, 'saveAs').mockImplementationOnce(jest.fn());

    exportSpreadsheetData(
      [
        { 'Match Count': '1' },
        {
          'Trial Id': 'EXAMPLE',
          Description: 'A test research study object for testing this feature.',
          Eligibility: 'Example Criteria',
          'Match Likelihood': 'Unknown likelihood',
          Title: 'Example Research Study',
          'Overall Status': 'active',
          Phase: 'Active',
          Sponsor: 'Example Sponsor Organization',
          'Overall Contact': 'Example Contact',
          'Overall Contact Phone': '781-555-0100',
          'Overall Contact Email': 'email@example.com',
        },
        { Facility: 'First Location', Phone: '123456789' },
        { Facility: 'Second Location', Email: 'email@example.com' },
      ],
      'sampleTrial'
    );

    expect(saverSpy).toHaveBeenCalledTimes(1);
    const calledWith = saverSpy.mock.calls[0];

    expect(calledWith[0] instanceof Blob).toBe(true);
    expect(calledWith[1]).toEqual('sampleTrial.xlsx');
  });
});
