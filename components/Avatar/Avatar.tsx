import { styled } from "@mui/material/styles";

import EgAvatar from "@eGroupAI/material/Avatar";

const Avatar = styled(EgAvatar)(({ theme, color }) => ({
  backgroundColor: !color ? "#F6F6F6" : color,
  color: theme.palette.text.primary,
}));

export default Avatar;
