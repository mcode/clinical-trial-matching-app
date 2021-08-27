import React, { ReactElement } from 'react';
import Image from 'next/image';
import { AppBar, Stack } from '@material-ui/core';

import Logo from '@/assets/images/logo.png';
import * as Styles from './Header.styles';

import { User } from '@/utils/user';

export type HeaderProps = {
  user?: User;
};

const Header = ({ user }: HeaderProps): ReactElement => (
  <AppBar position="static">
    <Stack alignItems="center" direction="row" justifyContent="space-between" px={2} py={1}>
      <Image src={Logo} alt="Clinical Trial Finder logo" layout="fixed" width={300} height={60} priority />
      {user && <Styles.UserName>{user.name}</Styles.UserName>}
    </Stack>
  </AppBar>
);
export default Header;
