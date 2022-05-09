import { Stack } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';
import { MutableRefObject, useRef } from 'react';
import StudyTags, { StudyTagsProps } from '../StudyTags';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<StudyTags />', () => {
  const isExpanded = false;
  const fewTags = ['tag-1', 'tag-2'];
  const manyTags = ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-5', 'tag-6', 'tag-7', 'tag-8', 'tag-9', 'tag-10'];

  // Don't re-implement React's codebase
  const Parent = ({ tags, ...props }: Partial<StudyTagsProps>) => {
    const ref: MutableRefObject<HTMLElement> = useRef<HTMLElement>(null);
    return (
      <Stack ref={ref} data-testid="parent" style={{ overflowY: 'auto' }}>
        <StudyTags isExpanded={isExpanded} tags={tags} scrollableParent={ref} {...props} />
      </Stack>
    );
  };

  const ComponentWithLittleTags = (props: Partial<StudyTagsProps>) => <Parent tags={fewTags} {...props} />;
  const ComponentWithManyTags = (props: Partial<StudyTagsProps>) => <Parent tags={manyTags} {...props} />;

  it('does not render a button to show more tags when there are too few', () => {
    render(<ComponentWithLittleTags />);

    expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
  });

  it('renders a button to show more tags when there are too many', () => {
    render(<ComponentWithManyTags />);

    expect(screen.queryByRole('button', { name: /show more/i })).toBeInTheDocument();
  });

  it('displays and hides additional tags when clicking the show more button', () => {
    render(<ComponentWithManyTags />);

    expect(screen.queryAllByTestId('tag').length).toBe(8);
    fireEvent(
      screen.queryByRole('button', { name: /show more/i }),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(screen.queryAllByTestId('tag').length).toBe(10);
    fireEvent(
      screen.queryByRole('button', { name: /show more/i }),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(screen.getByText(/tag\-9/i)).not.toBeVisible();
    expect(screen.getByText(/tag\-10/i)).not.toBeVisible();
  });

  it('hides additional tags when clicking away', async () => {
    render(<ComponentWithManyTags />);

    // We need a delay or the test will fail
    await new Promise(resolve => setTimeout(resolve, 1));

    fireEvent(
      screen.queryByRole('button', { name: /show more/i }),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
    fireEvent(
      screen.queryByTestId('parent'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(screen.getByText(/tag\-9/i)).not.toBeVisible();
    expect(screen.getByText(/tag\-10/i)).not.toBeVisible();
  });

  it('hides additional tags when scrolling away', () => {
    render(<ComponentWithManyTags />);

    fireEvent(
      screen.queryByRole('button', { name: /show more/i }),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    );
    fireEvent(
      screen.queryByTestId('parent'),
      new MouseEvent('scroll', {
        bubbles: true,
        cancelable: true,
      })
    );
    expect(screen.getByText(/tag\-9/i)).not.toBeVisible();
    expect(screen.getByText(/tag\-10/i)).not.toBeVisible();
  });
});
