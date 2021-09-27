import type { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppBar, Box, Stack } from '@mui/material';

import Logo from '@/assets/images/logo.png';

export type HeaderProps = {
  userName?: string;
};

const Header = ({ userName }: HeaderProps): ReactElement => (
  <AppBar position="static" sx={{ height: '80px' }}>
    <Stack alignItems="center" direction="row" justifyContent="space-between" px={2} py={1}>
      <Link href="/search" passHref>
        <Box sx={{ cursor: 'pointer' }}>
          <Image src={Logo} alt="Clinical Trial Finder logo" layout="fixed" width={300} height={60} priority />
        </Box>
      </Link>

      {userName && (
        <Box color="common.white" display={{ xs: 'none', sm: 'block' }} fontWeight="600" mr={1} textAlign="right">
          {userName}
        </Box>
      )}
    </Stack>
  </AppBar>
);

export default Header;
