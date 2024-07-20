import { styled } from "@mui/material/styles";

import React from "react";

export type ProgressBarProps = {
  /**
   * The primary color which presents  active slots
   */
  primaryColor?: string;

  /**
   * The secondary color which presents  currents slots
   */
  secondaryColor?: string;

  /**
   * The frame color which presents  total slots
   */
  frameColor?: string;

  /**
   * the number of slots which is actived
   */
  activeSlots: number;

  /**
   * total slots
   */
  totalSlots: number;

  /**
   * the number of  slots which is waiting for being actived
   */
  currentSlots: number;

  /**
   * the label of progress bar
   */
  label?: string;

  /**
   * the unit of slots such as cm,km,seats,...
   */
  unit: string;
};

const Wrapper = styled("div")`
  display: flex;
  flex-direction: column;
  min-height: 1px;
  font-family: "Poppins";
  width: 100%;
`;

const LabelWrapper = styled("div")`
  padding: 0 2px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const Label = styled("span")`
  font-size: 15px;
  padding: 0;
  margin: 0;
  font-weight: 400;
  line-height: 1;
  font-family: "Poppins";
`;

const Extra = styled(`span`)`
  font-size: 12px;
  padding: 0;
  margin: 0;
  font-weight: 400;
  line-height: 1;
`;

const ProgressBarWrapper = styled("div")`
  min-height: 12px;
  position: relative;
  margin-top: 10px;
`;

const Frame = styled("div")<{ width?: number; zIndex?: number }>`
  background: ${(props) => props.color};
  position: absolute;
  width: ${(props) => `${props.width}%`};
  min-height: 1px;
  border-radius: 30px;
  height: 100%;
  z-index: ${(props) => props.zIndex};
`;

const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const {
    label = "Seat",
    unit = "seats",
    totalSlots = 10,
    currentSlots = 7,
    activeSlots = 3,
    frameColor = "#D9D9D9",
    secondaryColor = "#FFBC6E",
    primaryColor = "#3DA5D9",
  } = props;
  return (
    <Wrapper>
      <LabelWrapper>
        <Label>{label}</Label>
        <Extra>
          {!currentSlots
            ? `${currentSlots} ${unit} used`
            : `${currentSlots} of ${totalSlots} ${unit} used`}
        </Extra>
      </LabelWrapper>
      <ProgressBarWrapper>
        <Frame color={frameColor} zIndex={1} width={100} />

        <Frame
          color={secondaryColor}
          width={(currentSlots / totalSlots) * 100}
          zIndex={2}
        />

        <Frame
          color={primaryColor}
          width={(activeSlots / totalSlots) * 100}
          zIndex={3}
        />
      </ProgressBarWrapper>
    </Wrapper>
  );
};

export default ProgressBar;
