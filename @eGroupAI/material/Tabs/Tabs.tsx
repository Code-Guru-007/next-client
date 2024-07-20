import React from "react";
import { Tabs as MuiTabs } from "@mui/material";
import { TabsProps as MuiTabsProps } from "@mui/material/Tabs";
import TabScrollButton from "@mui/material/TabScrollButton";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

export interface TabsProps extends MuiTabsProps {
  isBorder?: boolean;
  centered?: boolean;
}

// Custom scroll button component
const CustomScrollButton = (props) => {
  const { direction, ...other } = props;
  const id =
    direction === "left" ? "tab-scroll-left-btn" : "tab-scroll-right-btn";

  return <TabScrollButton id={id} direction={direction} {...other} />;
};

const useStyles = makeStyles(
  () => ({
    centered: {
      "& .MuiTabs-flexContainer": {
        justifyContent: "center",
      },
    },
    borderTabs: {
      "& .MuiTabs-indicator": {
        backgroundColor: "#FFF",
        bottom: "-1px",
      },
      "& .MuiButtonBase-root": {
        borderRadius: "5px 5px 0px 0px",
      },
      "& .Mui-selected": {
        border: "1px solid #E9E9E9",
        borderBottom: 0,
      },
      "& .MuiButtonBase-root:hover": {
        backgroundColor: "#F1F1F1",
      },
      "& .Mui-selected:hover": {
        backgroundColor: "#FFF",
      },
    },
  }),
  { name: "MuiEgTabs" }
);

const Tabs = (props: TabsProps) => {
  const { isBorder, centered, className, value, children, ...other } = props;
  const classes = useStyles(props);

  return (
    <MuiTabs
      value={value}
      className={clsx(
        {
          [classes.borderTabs]: isBorder,
          [classes.centered]: centered,
        },
        className
      )}
      ScrollButtonComponent={CustomScrollButton}
      {...other}
    >
      {children}
    </MuiTabs>
  );
};

export default Tabs;
