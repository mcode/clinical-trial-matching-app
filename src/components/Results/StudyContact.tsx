import { Email as EmailIcon, LocationOn as LocationOnIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import type { ReactElement } from 'react';
import { ContactProps } from './types';

type StudyContactProps = {
  contact: ContactProps;
  title: string;
};

const StudyContact = ({ contact, title }: StudyContactProps): ReactElement => (
  <Stack m={1}>
    <Box fontWeight="700" sx={{ textTransform: 'uppercase' }}>
      {title}
    </Box>

    {/* Display the contact only if it's different from the title */}
    {contact.name && contact.name != title && (
      <Box fontWeight="600" ml={2}>
        {contact.name}
      </Box>
    )}

    {contact.phone && (
      <Stack alignItems="center" direction="row" ml={4}>
        <PhoneIcon fontSize="small" sx={{ marginRight: 1 }} />
        {contact.phone}
      </Stack>
    )}

    {contact.email && (
      <Stack alignItems="center" direction="row" ml={4}>
        <EmailIcon fontSize="small" sx={{ marginRight: 1 }} />
        {contact.email}
      </Stack>
    )}

    {contact.distance && (
      <Stack alignItems="center" direction="row" ml={4}>
        <LocationOnIcon fontSize="small" sx={{ marginRight: 1 }} />
        {`${contact.distance.quantity} ${contact.distance.units}`}
      </Stack>
    )}
  </Stack>
);

export default StudyContact;
