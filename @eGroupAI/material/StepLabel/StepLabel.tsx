import { Check } from "@mui/icons-material";
import {
  StepIconProps,
  StepLabel as BaseLabel,
  StepLabelProps,
  styled,
} from "@mui/material";
import React from "react";

function StepIcon(props: StepIconProps) {
  const { completed, active, icon } = props;

  return (
    <div
      className={`labelIconWrapper ${completed ? "completed" : ""} ${
        active ? "active" : ""
      }`}
    >
      {completed ? (
        <Check className="labelIcon--completed" />
      ) : (
        <span className={active ? "labelIcon--active" : "labelIcon--inactive"}>
          {icon}
        </span>
      )}
    </div>
  );
}
const StepLabel: React.FC<StepLabelProps> = (props) => (
  <BaseLabel {...props} StepIconComponent={StepIcon} />
);

export default styled(StepLabel)`
  .labelIconWrapper {
    width: 29px;
    height: 29px;
    border-radius: 50%;
    background: #d9d9d9;
    display: flex;
    justify-content: center;
    align-items: center;
    &.active,
    &.completed {
      background-color: #034c8c;
    }
  }
  .labelIcon--active,
  .labelIcon--inactive {
    font-family: "Poppins";
    font-size: 15px;
    color: #ffffff;
  }
  .labelIcon--completed {
    color: #ffffff;
    font-size: 20px;
  }
  .MuiStepLabel-label.MuiStepLabel-alternativeLabel.Mui-completed,
  .MuiStepLabel-label.MuiStepLabel-alternativeLabel.Mui-active {
    font-weight: 500;
  }
  .MuiStepLabel-label.MuiStepLabel-alternativeLabel {
    margin-top: 7px;
  }
`;

export * from "@mui/material/StepLabel";
