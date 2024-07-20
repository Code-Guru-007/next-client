import React from "react";
import { Container as MuiContainer, ContainerProps, Card } from "@mui/material";
import { useSettingsContext } from "minimal/components/settings";

export interface Props extends ContainerProps {
  children?: React.ReactNode;
  noWrapper?: boolean;
}

const Container = (props: Props) => {
  const { children, maxWidth, noWrapper, ...others } = props;
  const settings = useSettingsContext();
  return (
    <MuiContainer maxWidth={settings.themeStretch ? false : "lg"} {...others}>
      {!noWrapper && <Card>{children}</Card>}
      {noWrapper && children}
    </MuiContainer>
  );
};

export default Container;
