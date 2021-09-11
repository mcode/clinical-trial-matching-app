import type { ReactElement } from 'react';
import Image from 'next/image';
import { AppBar, Box, Stack } from '@mui/material';

import { User } from '@/utils/user';
import Logo from '@/assets/images/logo.png';

export type HeaderProps = {
  user?: User;
};

const Header = ({ user }: HeaderProps): ReactElement => (
  <AppBar position="static">
    <Stack alignItems="center" direction="row" justifyContent="space-between" px={2} py={1}>
      <Image src={Logo} alt="Clinical Trial Finder logo" layout="fixed" width={300} height={60} priority />
      {user && (
        <Box color="common.white" fontWeight="600" mr={1}>
          {user.name}
        </Box>
      )}
    </Stack>
  </AppBar>
);

export default Header;
