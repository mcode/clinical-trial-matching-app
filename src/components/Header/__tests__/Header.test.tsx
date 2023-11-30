import mockUser from '@/__mocks__/user';
import { render, screen } from '@testing-library/react';
import Header, { HeaderProps } from '../Header';

describe('<Header />', () => {
  const Component = (props: Partial<HeaderProps>) => <Header {...props} />;

  it('renders the logo', () => {
    render(<Component />);

    expect(screen.getByRole('img', { name: /clinical trial finder logo/i })).toBeInTheDocument();
  });

  it('renders the user name if logged in', () => {
    render(<Component userName={mockUser.name} />);

    expect(screen.getByText(/dr\. leonard mccoy/i)).toBeInTheDocument();
  });
});
