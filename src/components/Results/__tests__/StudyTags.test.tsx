import { render, screen } from '@testing-library/react';
import StudyTags, { StudyTagsProps } from '../StudyTags';

afterEach(() => {
  jest.clearAllMocks();
});

describe('<StudyTags />', () => {
  const isExpanded = false;
  const manyTags = ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-5', 'tag-6', 'tag-7', 'tag-8', 'tag-9', 'tag-10'];
  const fewTags = ['tag-1', 'tag-2'];

  const ComponentWithManyTags = (props: Partial<StudyTagsProps>) => (
    <StudyTags isExpanded={isExpanded} tags={manyTags} {...props} />
  );

  const ComponentWithLittleTags = (props: Partial<StudyTagsProps>) => (
    <StudyTags isExpanded={isExpanded} tags={fewTags} {...props} />
  );

  it('renders a button to show more tags when there are too many', () => {
    render(<ComponentWithManyTags />);

    expect(screen.queryByRole('button', { name: /show more/i })).toBeInTheDocument();
  });

  it('does not render a button to show more tags when there are too few', () => {
    render(<ComponentWithLittleTags />);

    expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
  });
});
