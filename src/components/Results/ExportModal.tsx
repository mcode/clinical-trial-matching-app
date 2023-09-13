import { Button, Modal, Box, Typography, TextField, IconButton } from '@mui/material';
import { ReactElement, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export type ExportModalProps = {
  handleExportCsvStudies: () => string;
};

const ExportModal = ({ handleExportCsvStudies }: ExportModalProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const csv = handleExportCsvStudies();
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCopied(false);
  };
  const handleClipboard = () => {
    navigator.clipboard.writeText(csv);
    setCopied(true);
  };

  return (
    <div>
      <Button sx={{ mr: 2 }} onClick={handleOpen}>
        Generate CSV
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} bgcolor="grey.200">
          <Typography id="modal-modal-title" variant="h6" component="h3" sx={{ mb: '5' }}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <IconButton onClick={handleClipboard}>
              <ContentCopyIcon />
            </IconButton>
            {copied && 'Copied to Clipboard!'}
          </Typography>
          <TextField
            id="outlined-multiline-flexible"
            label="CSV"
            multiline
            sx={{ width: '100%', mt: '5' }}
            maxRows={20}
            InputProps={{
              readOnly: true,
            }}
            value={csv}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default ExportModal;

// import { Button, Modal, Box, Typography } from '@mui/material';
// import { ReactElement, useState } from 'react';

// export type ExportModalProps = {
//   handleExportCsvStudies: () => string;
// }

// const ExportModal = ({handleExportCsvStudies}: ExportModalProps): ReactElement => {
//    const [open, setOpen] = useState(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   return (
//     <div>
//       <Button sx={{ mr: 2 }} onClick={handleOpen}>Generate CSV</Button>
//       <Modal
//         open={open}
//         onClose={handleClose}
//       >
//         <Box>
//           <Box>
//             <Button sx={{ mr: 2 }} onClick={handleClose}>X</Button>
//           </Box>
//           <Box sx={{ mt: 2 }}>
//             {handleExportCsvStudies()}
//           </Box>
//         </Box>
//       </Modal>
//     </div>
//   );
// }

// export default ExportModal;
