// import { styled } from "@mui/material/styles";
import Avatar, { AvatarProps } from "@eGroupAI/material/Avatar";
import { Box } from "@mui/material";
import Iconify from "minimal/components/iconify";

export type CmsAvatarProps = AvatarProps & {
  useDefault?: string;
};

const CmsAvatar = (props: CmsAvatarProps) => {
  const { useDefault = false, src: srcProp, ...others } = props;
  if (useDefault) return <Avatar {...props} />;
  if (srcProp) return <Avatar src={srcProp} {...others} />;
  return (
    <Avatar {...others} style={{ position: "relative" }}>
      <Iconify
        icon="ic:round-image"
        width={48}
        height={48}
        color="#F4F6F8"
        zIndex={1}
      />
      <Box
        sx={{
          position: "absolute",
          zIndex: 0,
          backgroundColor: "#637381",
          width: "45%",
          height: "45%",
        }}
      />
    </Avatar>
  );
};

// const StyledCmsAvatar = styled(CmsAvatar)(() => ({
//   color: "#F4F6F8",
//   backgroundColor: "transparent",
// }));

export default CmsAvatar;
