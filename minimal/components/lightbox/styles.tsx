// @mui
import { useTheme, alpha } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";

// ----------------------------------------------------------------------

export default function StyledLightbox() {
  const theme = useTheme();

  const inputGlobalStyles = (
    <GlobalStyles
      styles={{
        ".yarl__root": {
          "--yarl__thumbnails_thumbnail_padding": 0,
          "--yarl__thumbnails_thumbnail_border": "transparent",
          "--yarl__color_backdrop":
            theme.palette.mode === "dark"
              ? alpha(theme.palette.grey[900], 0.9)
              : theme.palette.grey[0],
          "--yarl__slide_captions_container_background": alpha(
            theme.palette.grey[900],
            0.48
          ),
        },
        // Caption
        ".yarl__slide_title": {
          fontSize: theme.typography.h5.fontSize,
          fontWeight: theme.typography.h5.fontWeight,
          lineHeight: theme.typography.h5.lineHeight,
        },
        ".yarl__slide_description": {
          fontSize: theme.typography.body2.fontSize,
          fontWeight: theme.typography.body2.fontWeight,
          lineHeight: theme.typography.body2.lineHeight,
        },
        // Button
        ".yarl__button": {
          filter: "unset",
          color:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.grey[0], 0.8)
              : theme.palette.grey[600],
        },
        ".yarl__button:disabled": {
          color:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.grey[0], 0.4)
              : theme.palette.grey[400],
        },
        ".yarl__button:focus-visible:hover, .yarl__button:focus:hover, .yarl__button:hover":
          {
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.grey[0], 0.8)
                : theme.palette.grey[600],
          },
        ".yarl__button:focus-visible:disabled:hover, .yarl__button:focus:disabled:hover, .yarl__button:disabled:hover":
          {
            color:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.grey[0], 0.4)
                : theme.palette.grey[400],
          },
        ".yarl__button:focus:not(:focus-visible)": {
          color:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.grey[0], 0.8)
              : theme.palette.grey[600],
        },
        // Thumbnails
        ".yarl__thumbnails_thumbnail": {
          opacity: 0.48,
          "&.yarl__thumbnails_thumbnail_active": {
            opacity: 1,
          },
        },
        ".yarl__thumbnails_vignette": {
          "--yarl__thumbnails_vignette_size": 0,
        },
        // Video
        ".yarl__video_container": {
          backgroundColor: theme.palette.common.black,
        },
      }}
    />
  );

  return inputGlobalStyles;
}
