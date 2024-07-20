import React, { forwardRef } from "react";
import {
  Typography as MuiTypography,
  TypographyProps as MuiTypographyProps,
  Theme,
} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";

const weights = {
  light: 300,
  regular: 400,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
};

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    pointer: true;
    paragraph: true;
  }
}

export interface TypographyProps<D = React.ElementType>
  extends MuiTypographyProps {
  /**
   * Set color of Typography
   */
  color?: string;
  /**
   * Set defaultComponent of component
   */
  component?: D;
  /**
   * Set font-weight of Typography
   */
  weight?: "light" | "regular" | "semiBold" | "bold" | "extraBold";
  /**
   * Set point of Typography
   * If `true`, the element will be a point element.
   * @default false
   */
  point?: boolean;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily,
      fontStyle: "normal",
    },
    lightFontWeight: {
      fontWeight: weights.light,
    },
    regularFontWeight: {
      fontWeight: weights.regular,
    },
    semiBoldFontWeight: {
      fontWeight: weights.semiBold,
    },
    boldFontWeight: {
      fontWeight: weights.bold,
    },
    extraBoldFontWeight: {
      fontWeight: weights.extraBold,
    },
    heading1: {
      fontSize: "61.9px",
      lineHeight: "93px",
    },
    heading2: {
      fontSize: "41px",
      lineHeight: "62px",
    },
    heading3: {
      fontSize: "29px",
      lineHeight: "44px",
    },
    heading4: {
      fontSize: "24px",
      lineHeight: "36px",
    },
    heading5: {
      fontSize: "15px",
      lineHeight: "22px",
    },
    heading6: {
      fontSize: "10px",
      lineHeight: "15px",
    },
    body1: {
      fontSize: "16px",
      lineHeight: "24px",
    },
    body2: {
      fontSize: "18px",
      lineHeight: "27px",
    },
    paragraphClass: {
      fontFamily: theme.typography.fontFamily,
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "30px",
      marginBottom: "30px",
    },
    pointClass: {
      fontFamily: theme.typography.fontFamily,
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "20px",
      lineHeight: "30px",
      marginBottom: "30px",
    },

    colorDefault: {
      color: theme.palette.text.primary,
    },
    colorInherit: {
      color: "inherit",
    },
    colorText: {
      color: theme.palette.text.primary,
    },
    colorTextSecondary: {
      color: theme.palette.text.secondary,
    },
    colorPrimary: {
      color: theme.palette.primary.main,
    },
    colorSecondary: {
      color: theme.palette.secondary.main,
    },
    colorWhite: {
      color: theme.palette.grey[700],
    },
    colorGrey: {
      color: theme.palette.grey[100],
    },
    colorSuccess: {
      color: theme.palette.success.main,
    },
    colorInfo: {
      color: theme.palette.info.main,
    },
    colorWarning: {
      color: theme.palette.warning.main,
    },
    colorError: {
      color: theme.palette.error.main,
    },
  }),
  {
    name: "MuiEgTypography",
  }
);

const Typography = forwardRef<HTMLSpanElement, TypographyProps>(
  (props, ref) => {
    const {
      lightFontWeight,
      regularFontWeight,
      semiBoldFontWeight,
      boldFontWeight,
      extraBoldFontWeight,
      heading1,
      heading2,
      heading3,
      heading4,
      heading5,
      heading6,
      body1,
      body2,
      paragraphClass,
      pointClass,

      colorDefault,
      colorError,
      colorGrey,
      colorInfo,
      colorInherit,
      colorPrimary,
      colorSecondary,
      colorSuccess,
      colorText,
      colorTextSecondary,
      colorWarning,
      colorWhite,

      ...classes
    } = useStyles(props);

    const {
      className,
      variant,
      weight,
      paragraph,
      point,
      color = "default",
      ...others
    } = props;

    return (
      <MuiTypography
        ref={ref}
        className={clsx(
          {
            [paragraphClass]: paragraph,
            [pointClass]: point,
            [heading1]: variant === "h1",
            [heading2]: variant === "h2",
            [heading3]: variant === "h3",
            [heading4]: variant === "h4",
            [heading5]: variant === "h5",
            [heading6]: variant === "h6",
            [body1]: variant === "body1",
            [body2]: variant === "body2",
            [lightFontWeight]: weight === undefined,
            [lightFontWeight]: weight === "light",
            [regularFontWeight]: weight === "regular",
            [semiBoldFontWeight]: weight === "semiBold",
            [boldFontWeight]: weight === "bold",
            [extraBoldFontWeight]: weight === "extraBold",

            [colorDefault]: color === "default",
            [colorError]: color === "error",
            [colorGrey]: color === "grey",
            [colorInfo]: color === "info",
            [colorInherit]: color === "inherit",
            [colorPrimary]: color === "primary",
            [colorSecondary]: color === "secondary",
            [colorSuccess]: color === "success",
            [colorText]: color === "text",
            [colorTextSecondary]: color === "textSecondary",
            [colorWarning]: color === "warning",
            [colorWhite]: color === "white",
          },
          className
        )}
        classes={classes}
        variant={variant}
        color={color}
        {...others}
      />
    );
  }
);

export default Typography;
