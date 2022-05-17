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
          trialId: 'NCT02684032',
          likelihood: {
            text: 'Unknown likelihood',
            color: 'common.grayLight',
            score: undefined,
          },
        },
      ])
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ 'Match Count': '1' }),
        expect.objectContaining({
          'Match Likelihood': 'Unknown likelihood',
          'Trial Id': 'NCT02684032',
          Conditions: '',
          Description: '',
          Eligibility: '',
          'Overall Contact': '',
          'Overall Contact Email': '',
          'Overall Contact Phone': '',
          'Overall Status': '',
          Period: '',
          'Trial Phase': '',
          Sponsor: '',
          'Study Type': '',
          Title: '',
        }),
      ])
    );
  });

  it('exports sites', () => {
    expect(
      unpackStudies([
        {
          trialId: 'EXAMPLE',
          title: 'Example Research Study',
          description: 'A test research study object for testing this feature.',
          status: { name: 'active', label: 'Active', color: 'common.red' },
          phase: 'Active',
          conditions: ['condition-1', 'condition-2'],
          source: 'Unknown',
          eligibility: 'Example Criteria',
          keywords: ['keyword'],
          likelihood: {
            text: 'Possible match',
            color: 'common.yellow',
            score: 0.5,
          },
          period: 'Jan 2, 2021 - Mar 4, 2021',
          sponsor: {
            name: 'Example Sponsor Organization',
          },
          contacts: [
            {
              name: 'Example Contact',
              phone: '781-555-0100',
              email: 'email@example.com',
            },
          ],
          type: { name: 'Example Type' },
          closestFacilities: [
            {
              distance: {
                quantity: 2.0,
                units: 'miles',
              },
            },
          ],
          locations: [
            {
              resourceType: 'Location',
              id: 'location-0',
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
              id: 'location-1',
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
          'Overall Status': 'Active',
          'Trial Phase': 'Active',
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
