import BookmarkCheck from '@/assets/images/bookmark-check.svg';
import { SvgIconComponent } from '@mui/icons-material';
import { SvgIcon, SvgIconProps, Icon } from '@mui/material';
const BookmarkCheckIcon: SvgIconComponent = (props: SvgIconProps) => (
  <SvgIcon {...props} component={BookmarkCheck} viewBox="0 0 21 27" />
);
BookmarkCheckIcon.muiName = Icon.muiName;
export default BookmarkCheckIcon;
