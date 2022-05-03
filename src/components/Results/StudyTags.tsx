import { Button, Chip, ClickAwayListener, Fade, Paper, Popper, useMediaQuery, useTheme } from '@mui/material';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import type { ReactElement } from 'react';

export type StudyTagsProps = {
  isExpanded: boolean;
  tags: string[];
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
      />
    );

const StudyTags = ({ isExpanded, tags }: StudyTagsProps): ReactElement => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const numberOfVisibleTags = isMediumScreen ? 4 : 8;
  const shouldDisplayMore = tags.length > numberOfVisibleTags;

  return (
    <>
      {(shouldDisplayMore ? tags.slice(0, numberOfVisibleTags) : tags).map(renderTag(isExpanded))}
      {shouldDisplayMore && (
        <PopupState variant="popper" popupId="popup-popper">
          {popupState => {
            const bindToggleProps = bindToggle(popupState);
            const { onClick } = bindToggleProps;
            const { setOpen } = popupState;

            return (
              <>
                <Button
                  {...bindToggleProps}
                  variant="text"
                  size="small"
                  onClick={event => {
                    // We don't want to expand/collapse the accordion when triggering the popper.
                    event.stopPropagation();
                    onClick(event);
                  }}
                  sx={{ px: 1, py: 0, mt: 0.5 }}
                >
                  Show more
                </Button>
                <ClickAwayListener onClickAway={() => setOpen(false)}>
                  <Popper {...bindPopper(popupState)} transition placement="bottom">
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
            );
          }}
        </PopupState>
      )}
    </>
  );
};

export default StudyTags;
