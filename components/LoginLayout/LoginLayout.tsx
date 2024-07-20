import Image from "next/image";
// @mui
import { SxProps, Theme, alpha, useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// hooks
import { useResponsive } from "minimal/hooks/use-responsive";
// theme
import { bgGradient } from "minimal/theme/css";
// components
import { lowerCase } from "lodash";

// ----------------------------------------------------------------------

type Props = {
  title: string;
  children: React.ReactNode;
  alignValue?: string;
};

export default function AuthClassicLayout({
  children,
  title,
  alignValue,
}: Props) {
  const theme = useTheme();

  const upMd = useResponsive("up", "md");

  const align = alignValue ? lowerCase(alignValue) : "right";

  const renderContent = (
    <Stack
      sx={
        {
          width: 1,
          mx: "auto",
          maxWidth: 480,
          px: { xs: 2, md: 8 },
          py: { xs: 5 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          background: theme.palette.background.default,
          borderRadius: 2,
          ...(align === "center" && { maxWidth: 420, px: 3 }),
        } as SxProps<Theme>
      }
    >
      <Stack direction="row" justifyContent="center" alignItems="center">
        <Image
          src="/logo-with-blue-title.png"
          alt="InfoCenter's logo with title"
          width={1351}
          height={355}
          style={{ width: 200, height: "auto", marginBottom: theme.spacing(5) }}
        />
      </Stack>
      {children}
    </Stack>
  );

  const sectionBackground = bgGradient({
    color: alpha(theme.palette.grey[900], 0.5),
    imgUrl: "/assets/images/login/background.jpg",
  });
  const backdropFilter = "blur(16px)";

  const renderSection = (
    <Box flexGrow={1} sx={{ ...(align !== "center" && sectionBackground) }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={10}
        height="100%"
        sx={{ px: 2, backdropFilter }}
      >
        <Typography
          variant="h3"
          color="white"
          sx={{ maxWidth: 480, textAlign: "center" }}
        >
          {title}
        </Typography>
        <Image
          src="/assets/images/login/animation.gif"
          alt=""
          width={530}
          height={360}
          style={{ width: 530, height: "auto" }}
        />
      </Stack>
    </Box>
  );

  const renderCornerLogo = (
    <Image
      src="/logo-with-white-title.png"
      alt="InfoCenter's logo with title"
      width={1351}
      height={355}
      style={{
        width: 120,
        height: "auto",
        display: upMd ? "block" : "none",
        zIndex: 1,
        position: "absolute",
        top: 30,
        ...(align === "left" ? { right: 30 } : { left: 30 }),
      }}
    />
  );

  return (
    <Box sx={{ ...(align === "center" && upMd && sectionBackground) }}>
      <Stack
        component="main"
        direction={align === "right" ? "row" : "row-reverse"}
        alignItems={align === "center" ? "center" : "normal"}
        sx={{ minHeight: "100vh", backdropFilter }}
      >
        {renderCornerLogo}

        {align !== "center" && upMd && renderSection}
        {renderContent}
      </Stack>
    </Box>
  );
}
