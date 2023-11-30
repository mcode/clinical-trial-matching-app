import Target from '@/assets/images/target.svg';
import { SvgIconComponent } from '@mui/icons-material';
import { Icon, SvgIcon, SvgIconProps } from '@mui/material';
const TargetIcon: SvgIconComponent = (props: SvgIconProps) => (
  <SvgIcon {...props} component={Target} viewBox="0 0 24 24" />
);
TargetIcon.muiName = Icon.muiName;
export default TargetIcon;
