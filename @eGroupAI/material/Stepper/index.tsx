import React from "react";
import {
  Stepper as BaseStepper,
  StepperProps,
  styled,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";

const Connector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: "14px",
    left: "calc(-50% + 22px)",
    right: "calc(50% + 22px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#034C8C",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#034C8C",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 1,
  },
}));
const Stepper: React.FC<StepperProps> = (props) => (
  <BaseStepper alternativeLabel connector={<Connector />} {...props} />
);

export default Stepper;
export * from "@mui/material/Stepper";
