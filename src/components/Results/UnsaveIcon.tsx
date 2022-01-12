import Unsave from '@/assets/images/unsave.svg';
import { SvgIconComponent } from '@mui/icons-material';
import { SvgIcon, SvgIconProps, Icon } from '@mui/material';
const UnsaveIcon: SvgIconComponent = (props: SvgIconProps) => (
  <SvgIcon {...props} component={Unsave} viewBox="-1 -2 24 24" />
);
UnsaveIcon.muiName = Icon.muiName;
export default UnsaveIcon;
