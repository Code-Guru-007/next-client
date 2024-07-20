import { darken, alpha } from "@mui/material";
import getColorObject from "./getColorObject";

export const egPalette = {
  text: [
    darken("#000000", 0.1),
    "#000000",
    "#646464",
    "#9E9E9E",
    "#D9D9D9",
    "#F1F1F1",
    "#EEEEEE",
    "#FFFFFF",
    "#F5F5F5",
  ],
  primary: [
    darken("#034C8C", 0),
    "#034C8C",
    "#356FA3",
    "#3DA5D9",
    "#00C7EF",
    "#DEEAFB",
    "#F5F6FA",
    alpha("#034C8C", 0.4),
  ],
  secondary: getColorObject("#E95050"),
  info: getColorObject("#05C7F2"),
  success: [
    darken("#23968E", 0.1),
    "#23968E",
    "#00BF78",
    "#5EC61E",
    "#C3E2AF",
    "#EAF8F4",
    "#F4F9F7",
  ],
  warning: [
    darken("#FF9E2E", 0.1),
    "#FF9E2E",
    "#FFBC6E",
    "#FEC601 ",
    "#FFE8CD",
    "#F9F3EC",
    "#FFF8F0",
  ],
  error: [
    darken("#B43D3D", 0.1),
    "#B43D3D",
    "#E95050",
    "#ED6C6C",
    "#F69D9D",
    "#FCEDED",
    "#FFF4F4",
  ],
  darkGrey: [
    darken("#9E9E9E", 0),
    "#B43D3D",
    "#E95050",
    "#ED6C6C",
    "#F69D9D",
    "#F3DDDD",
    "#FFF4F4",
  ],
  grey: getColorObject("#646464"),
};

export const palette = {
  text: {
    primary: egPalette.text[1],
    secondary: egPalette.text[3],
  },
  info: {
    dark: egPalette.info[0],
    main: egPalette.info[1],
    light: egPalette.info[2],
  },
  primary: {
    dark: egPalette.primary[0],
    main: egPalette.primary[1],
    light: egPalette.primary[2],
  },
  secondary: {
    dark: egPalette.secondary[0],
    main: egPalette.secondary[1],
    light: egPalette.secondary[2],
  },
  success: {
    dark: egPalette.success[0],
    main: egPalette.success[1],
    light: egPalette.success[2],
  },
  warning: {
    dark: egPalette.warning[0],
    main: egPalette.warning[1],
    light: egPalette.warning[2],
  },
  error: {
    dark: egPalette.error[0],
    main: egPalette.error[1],
    light: egPalette.error[2],
  },
  darkGrey: {
    dark: egPalette.darkGrey[0],
    main: egPalette.darkGrey[1],
    light: egPalette.darkGrey[2],
  },
  action: {
    disabledBackground: "#DCDCDC",
  },
  lightGrey: {
    lightGrey: "#f5f5f5",
    lightestGrey: "#f1f1f1",
    white: "#ffffff",
    secondaryGrey: "#F5F6FA",
  },
};

export const egShadows = [
  "none",
  "0 3px 16px 0 rgba(10, 75, 109, 0.08)",
  "0 6px 26px 0 #efeff7",
  "0px 0px 30px 1px #0000001f",
];

export const egShape = {
  borderRadius: 25,
};

export const fontFamily = [
  '"Poppins"',
  '"Poppins-Light"',
  '"Segoe UI"',
  '"SegoeUI"',
  '"Microsoft JhengHei"',
  '"微軟正黑體"',
  '"SF Pro TC"',
  '"SF Pro Display"',
  '"SF Pro Icons"',
  '"PingFang TC"',
  '"Helvetica Neue"',
  '"Helvetica"',
  '"Arial"',
  '"sans-serif"',
];

export const typography = {
  fontFamily: fontFamily.join(","),
  h1: {
    fontSize: "3.86rem",
  },
  h2: {
    fontSize: "2.56rem",
  },
  h3: {
    fontSize: "1.81rem",
  },
  h4: {
    fontSize: "1.5rem",
  },
  h5: {
    fontSize: "0.94rem",
  },
  h6: {
    fontSize: "0.63rem",
  },
  body1: {
    fontSize: "1rem",
  },
  body2: {
    fontSize: "1.125rem",
  },
};

export type ColorObject = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
};
export type EgPalette = {
  text: ColorObject;
  primary: ColorObject;
  secondary: ColorObject;
  info: ColorObject;
  success: ColorObject;
  warning: ColorObject;
  error: ColorObject;
  grey: ColorObject;
  darkGrey: ColorObject;
};
export type EgShadows = string[];
export type EgShape = {
  borderRadius: number;
};
