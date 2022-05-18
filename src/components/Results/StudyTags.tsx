import { Button, Chip, ClickAwayListener, Fade, Paper, Popper, useMediaQuery, useTheme } from '@mui/material';
import { ReactElement, MouseEvent, useEffect, useState, MutableRefObject } from 'react';

export type StudyTagsProps = {
  isExpanded: boolean;
  tags: string[];
  scrollableParent: MutableRefObject<HTMLElement>;
};

const renderTag =
  (isExpanded: boolean) =>
  (tag: string, index: number): JSX.Element =>
    (
      <Chip
        key={index}
        label={tag}
        sx={{
          backgroundColor: isExpanded ? 'common.white' : 'common.grayLight',
          color: isExpanded ? 'common.gray' : 'common.grayLighter',
          fontWeight: '600',
          marginRight: 1,
          marginTop: 0.5,
          textTransform: 'uppercase',
        }}
        size="small"
        data-testid="tag"
      />
    );

const StudyTags = ({ isExpanded, tags, scrollableParent }: StudyTagsProps): ReactElement => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const numberOfVisibleTags = isMediumScreen ? 4 : 8;
  const shouldDisplayMore = tags.length > numberOfVisibleTags;
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(previousOpen => !previousOpen);
    // We don't want to expand/collapse the accordion when triggering the popper.
    event.stopPropagation();
  };

  const closePopperOnParentScroll = () => {
    const parent = scrollableParent.current;
    const onScroll = () => setOpen(false);
    parent.removeEventListener('scroll', onScroll);
    parent.addEventListener('scroll', onScroll, { passive: true });
    return () => parent.removeEventListener('scroll', onScroll);
  };

  useEffect(closePopperOnParentScroll, [scrollableParent]);

  return (
    <>
      {(shouldDisplayMore ? tags.slice(0, numberOfVisibleTags) : tags).map(renderTag(isExpanded))}
      {shouldDisplayMore && (
        <>
          <Button variant="text" size="small" onClick={handleClick} sx={{ px: 1, py: 0, mt: 0.5 }}>
            Show more
          </Button>
          <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Popper transition placement="bottom" open={open} anchorEl={anchorEl}>
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      bgcolor: isExpanded ? 'common.gray' : 'common.grayLighter',
                    }}
                  >
                    {tags.slice(numberOfVisibleTags).map(renderTag(isExpanded))}
                  </Paper>
                </Fade>
              )}
            </Popper>
          </ClickAwayListener>
        </>
      )}
    </>
  );
};

export default StudyTags;
