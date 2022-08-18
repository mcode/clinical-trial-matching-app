import mockPatient from '@/__mocks__/patient';
import { render, screen } from '@testing-library/react';
import PatientCard, { PatientCardProps } from '../PatientCard';

describe('<PatientCard />', () => {
  const Component = (props: Partial<PatientCardProps>) => <PatientCard patient={mockPatient} {...props} />;

  it('renders the patient card with patient data', () => {
    render(<Component />);

    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(screen.getByText(/nyota uhura/i)).toBeInTheDocument();
    expect(screen.getByText(/female/i)).toBeInTheDocument();
    expect(screen.getByText(/28 yrs/i)).toBeInTheDocument();
  });
});
