import { render, screen } from '@testing-library/react';
import mockSearchResults from '@/__mocks__/resultDetails.json';
import { ArmGroup } from '../types';
import ArmInterventions from '../ArmInterventions';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<ArmsInterventions />', () => {
  const arms = mockSearchResults.results[0].arms as ArmGroup[];

  const ComponentWithInterventions = (props: Partial<ArmGroup>) => (
    <ArmInterventions
      display={arms[0].display}
      description={arms[0].description}
      interventions={arms[0].interventions}
      {...props}
    ></ArmInterventions>
  );

  const ComponentWithNoInterventions = (props: Partial<ArmGroup>) => (
    <ArmInterventions
      display={arms[1].display}
      description={arms[1].description}
      interventions={arms[1].interventions}
      {...props}
    ></ArmInterventions>
  );

  it('renders component with interventions', () => {
    render(<ComponentWithInterventions />);
    // Intervention header is there
    expect(screen.queryByText('Interventions')).toBeInTheDocument();

    // Arm group titles are there with types and subtitles
    expect(screen.queryByText('Drug: Paclitaxel (Anzatax)')).toBeInTheDocument();
    expect(screen.queryByText('Radiation: Radium Ra 223 Dichloride')).toBeInTheDocument();

    const descriptions = screen.queryAllByText(/Given IV/);
    expect(descriptions.length).toBe(2);
  });

  it('renders component without interventions', () => {
    render(<ComponentWithNoInterventions />);

    // No interventions rendered
    expect(screen.queryByText('Interventions')).not.toBeInTheDocument();
  });
});
