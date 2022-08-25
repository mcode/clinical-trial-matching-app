import mockUser from '@/__mocks__/user';
import { Person as PersonIcon } from '@mui/icons-material';
import { render, screen } from '@testing-library/react';
import SidebarAccordion, { SidebarAccordionProps } from '../SidebarAccordion';

const title = 'Provider Information';
const icon = <PersonIcon fontSize="large" />;
const child = <p>{mockUser.name}</p>;

describe('<SidebarAccordion />', () => {
  const Component = (props: Partial<SidebarAccordionProps>) => (
    <SidebarAccordion icon={icon} title={title} {...props}>
      {child}
    </SidebarAccordion>
  );

  it('renders the sidebar accordion', () => {
    render(<Component />);

    expect(screen.getByText(/provider information/i)).toBeInTheDocument();
    expect(screen.getByTestId('PersonIcon'));
    expect(screen.getByText(/dr\. leonard mccoy/i)).toBeInTheDocument();
    expect(screen.getByTestId('ExpandMoreIcon'));
  });
});
