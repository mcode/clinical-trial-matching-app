import { Stack } from '@mui/material';
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import Study, { StudyProps } from '../Study';
import { StudyDetailProps } from '../types';
import { prettyDOM } from '@testing-library/dom';

afterEach(() => {
  jest.clearAllMocks();
});

// Mock SVG icons (they break horribly within Jest otherwise)
jest.mock('@mui/material/node/SvgIcon', () => () => <div />);

describe('<Study />', () => {
  const TestStudy = ({ entry, handleSaveStudy, isStudySaved, ...props }: Partial<StudyProps>) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <Stack ref={ref} data-testid="parent" style={{ overflowY: 'auto' }}>
        <Study
          entry={entry}
          handleSaveStudy={handleSaveStudy ?? jest.fn()}
          isStudySaved={isStudySaved ?? false}
          scrollableParent={ref}
          {...props}
        />
      </Stack>
    );
  };

  const exampleStudy: StudyDetailProps = {
    trialId: 'NCT12345678',
    conditions: [],
    contacts: [],
    sponsor: {
      name: 'Demo Sponsor',
      distance: {
        quantity: 21,
        units: 'miles',
      },
    },
    closestFacilities: [
      {
        name: 'Example',
        distance: {
          quantity: 5,
          units: 'miles',
        },
      },
    ],
    status: {
      name: 'active',
      color: 'green',
      label: 'Active',
    },
    likelihood: {
      color: 'green',
      score: 1.0,
      text: 'Match',
    },
  };

  it('handles expanding', () => {
    render(<TestStudy entry={exampleStudy} />);
    const accordion = screen.getByText(/Closest Facilities/).parentElement.parentElement;
    expect(accordion).toHaveAttribute('aria-expanded', 'false');
    act(() => {
      accordion.click();
    });
    expect(accordion).toHaveAttribute('aria-expanded', 'true');
  });
});
