import Logo from '@/assets/images/logo.png';
import { AppBar, Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

export type HeaderProps = {
  userName?: string;
};

const Header = ({ userName }: HeaderProps): ReactElement => {
  const theme = useTheme();
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static">
      <Stack alignItems="center" direction="row" justifyContent="space-between" px={2} py={1}>
        <Link href="/search" passHref>
          <Stack sx={{ cursor: 'pointer' }}>
            <Image
              src={Logo}
              alt="Clinical Trial Finder logo"
              layout="fixed"
              width={isExtraSmallScreen ? 240 : 300}
              height={isExtraSmallScreen ? 48 : 60}
              priority
            />
          </Stack>
        </Link>

        {userName && !isExtraSmallScreen && (
          <Box color="common.white" fontWeight="600" mr={1} textAlign="right" data-testid="userName">
            {userName}
          </Box>
        )}
      </Stack>
    </AppBar>
  );
};

export default Header;
