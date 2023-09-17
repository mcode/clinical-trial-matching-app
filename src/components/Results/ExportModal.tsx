import { Button, Modal, Box, TextField, IconButton, Alert, Tooltip, Stack } from '@mui/material';
import { ReactElement, Fragment, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '75%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export type ExportModalProps = {
  handleContentGeneration: () => string;
  label?: string;
  replaceButton?: (onClick) => ReactElement;
};

const ExportModal = ({ handleContentGeneration, label, replaceButton }: ExportModalProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  let content = handleContentGeneration();

  const handleOpen = () => {
    content = handleContentGeneration();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCopied(false);
  };
  const handleClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
  };

  return (
    <Fragment>
      {replaceButton ? (
        replaceButton(handleOpen)
      ) : (
        <Button sx={{ mr: 2 }} onClick={handleOpen}>
          {label}
        </Button>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} bgcolor="grey.200">
          <Stack spacing={3}>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>

              <Tooltip title="Add to clipboard" placement="top">
                <IconButton onClick={handleClipboard}>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>

              {copied && (
                <Alert style={{ width: '25%' }} severity="success">
                  Copied to clipboard!{' '}
                </Alert>
              )}
            </Stack>

            <TextField
              id="outlined-multiline-flexible"
              label="Content"
              multiline
              sx={{ width: '100%', mt: '5' }}
              maxRows={20}
              InputProps={{
                readOnly: true,
              }}
              value={content}
            />
          </Stack>
        </Box>
      </Modal>
    </Fragment>
  );
};

export default ExportModal;
